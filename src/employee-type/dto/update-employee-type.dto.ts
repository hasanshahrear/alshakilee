import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
import { CreateEmployeeTypeDto } from './create-employee-type.dto';

export class UpdateEmployeeTypeDto extends PartialType(CreateEmployeeTypeDto) {}

export class PatchEmployeeTypeDto extends PartialType(CreateEmployeeTypeDto) {
  @IsBoolean()
  isActive?: boolean;
}
