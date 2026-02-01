import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class ScanInvoiceTrackingDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  invoiceId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  employeeTypeId: number;

  @IsString()
  @IsNotEmpty()
  changedBy?: string;
}
