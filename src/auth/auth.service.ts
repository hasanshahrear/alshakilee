import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  // async signIn(phone: string, password: string): Promise<any> {
  //   const user = await this.userService.findOne(phone);
  //   if (user?.password !== password) {
  //     throw new UnauthorizedException();
  //   }
  //   const { password, ...result } = user;
  //   // Generate a JWT and return it here instead of the user object
  //   // Assuming you have JwtService injected and configured
  //   const payload = { phone: user.phone, sub: user.id };
  //   const access_token = await this.jwtService.signAsync(payload);
  //   return { access_token };
  // }

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
}
