import { PartialType } from '@nestjs/mapped-types';
import { CreateInvoiceTrackingDto } from './create-invoice-tracking.dto';

export class UpdateInvoiceTrackingDto extends PartialType(
  CreateInvoiceTrackingDto,
) {}
