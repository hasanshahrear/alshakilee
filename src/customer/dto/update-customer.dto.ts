import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {}
export class PatchCustomerDto extends PartialType(CreateCustomerDto) {
  @IsBoolean()
  isActive?: boolean;
}
