import { UserRole } from '@prisma/client';
import { IsString, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsString()
  phone: string;

  @IsString()
  password: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
