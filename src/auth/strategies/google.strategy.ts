import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { EmployeeService } from '../../employee/employee.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private employeeService: EmployeeService,
  ) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'),
      scope: ['profile', 'email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    try {
      let employee = await this.employeeService.findByGoogleId(profile.id);

      if (!employee) {
        // Check if employee exists by email
        employee = await this.employeeService.findByEmail(
          profile.emails[0].value,
        );

        if (employee) {
          // Update existing employee with Google ID
          const updateResponse = await this.employeeService.update(
            employee.id,
            {},
          );
          return done(null, updateResponse?.data || updateResponse);
        } else {
          // Create new employee in pending status
          // Note: employeeTypeId should be assigned during admin approval
          // For now, we'll need to handle this in the controller
          return done(null, {
            email: profile.emails[0].value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            googleId: profile.id,
            profilePicture: profile.photos[0]?.value,
            isNewEmployee: true,
          });
        }
      }

      return done(null, employee);
    } catch (error) {
      return done(error);
    }
  }
}
