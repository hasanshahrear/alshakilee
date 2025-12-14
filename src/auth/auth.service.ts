import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { EmployeeService } from 'src/employee/employee.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private employeeService: EmployeeService,
    private jwtService: JwtService,
  ) {}

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.userService.findByPhone(phone);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { phone: user.phone, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
      },
    };
  }

  async googleLogin(user: any) {
    // Check if user is a new employee
    if (user.isNewEmployee) {
      return {
        status: 'PENDING_REGISTRATION',
        user,
        message: 'Employee registration required. Admin approval pending.',
        access_token: null,
      };
    }

    // Check if employee exists and is approved
    const employee = user.id
      ? user
      : await this.employeeService.findByEmail(user.email);

    if (!employee) {
      return {
        status: 'NOT_FOUND',
        message: 'Employee not found. Please contact admin for registration.',
        access_token: null,
      };
    }

    if (employee.status !== 'APPROVED') {
      return {
        status: employee.status,
        message: `Your account is ${employee.status.toLowerCase()}. Only approved employees can access the system.`,
        access_token: null,
      };
    }

    // Generate JWT for approved employee
    const payload = { email: employee.email, sub: employee.id };
    return {
      status: 'APPROVED',
      access_token: this.jwtService.sign(payload),
      user: {
        id: employee.id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        employeeType: employee.employeeType?.name,
      },
    };
  }

  async registerEmployee(registerDto: {
    email: string;
    firstName: string;
    lastName: string;
    employeeTypeId: number;
    googleId?: string;
    profilePicture?: string;
  }) {
    try {
      const employee = await this.employeeService.create({
        email: registerDto.email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        employeeTypeId: registerDto.employeeTypeId,
        profilePicture: registerDto.profilePicture,
      });

      return {
        status: 'PENDING',
        message: 'Registration successful. Waiting for admin approval.',
        employee: {
          id: employee.id,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          status: employee.status,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
