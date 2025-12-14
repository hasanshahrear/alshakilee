import { IsEmail, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreateEmployeeDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsNumber()
  employeeTypeId: number;

  @IsString()
  @IsOptional()
  profilePicture?: string;
}
