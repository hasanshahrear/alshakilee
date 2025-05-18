import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean, IsNumber } from 'class-validator';
import { CreateInvoiceDto } from './create-invoice.dto';

export class UpdateInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsNumber()
  id?: number;
}

export class PatchInvoiceDto extends PartialType(CreateInvoiceDto) {
  @IsBoolean()
  isActive?: boolean;
}
