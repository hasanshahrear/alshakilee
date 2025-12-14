import { IsOptional, IsString, IsEnum, IsBoolean } from 'class-validator';

export enum EmployeeStatusEnum {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class UpdateEmployeeDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEnum(EmployeeStatusEnum)
  @IsOptional()
  status?: EmployeeStatusEnum;

  @IsString()
  @IsOptional()
  rejectionReason?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  approvedBy?: string;
}
