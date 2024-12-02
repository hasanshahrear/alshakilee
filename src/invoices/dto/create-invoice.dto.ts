import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsInt,
  IsPositive,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreateItemDto } from './create-invoice-item.dto';

export class CreateInvoiceDto {
  @IsInt()
  @IsPositive()
  customerId: number;

  @IsString()
  @IsDateString({ strict: true })
  deliveryDate: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateItemDto)
  items: CreateItemDto[];
}
