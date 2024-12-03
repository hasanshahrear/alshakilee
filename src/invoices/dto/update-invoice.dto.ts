import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {}

export class PatchInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsBoolean()
  isActive?: boolean;
}
