import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateEmployeeTypeDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  @IsOptional()
  name?: string;
}
