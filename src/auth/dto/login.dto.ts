import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  phone: string;

  @IsString()
  @MinLength(6)
  password: string;
}
