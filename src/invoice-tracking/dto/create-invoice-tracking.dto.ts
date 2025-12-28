import { IsInt, IsNotEmpty, IsString, Min, IsOptional } from 'class-validator';

export class CreateInvoiceTrackingDto {
  @IsInt()
  @IsNotEmpty()
  @Min(1)
  invoiceId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  userId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  employeeTypeId: number;

  @IsString()
  @IsNotEmpty()
  status: string; // 'pending' or 'done'

  @IsString()
  @IsOptional()
  changedBy?: string;
}
