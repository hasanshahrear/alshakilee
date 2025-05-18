import { EPanType, EPocketStyle, ESDType, ESewingType } from '@prisma/client';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
} from 'class-validator';

export class CreateItemDto {
  id?: number;

  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  shoulder: number;

  @IsNumber()
  @Min(0)
  hand: number;

  @IsString()
  handLoose: string;

  @IsNumber()
  @Min(0)
  neck: number;

  @IsNumber()
  @Min(0)
  chestLoose: number;

  @IsString()
  centreLoose: string;

  @IsNumber()
  @Min(0)
  downLoose: number;

  @IsNumber()
  @Min(0)
  open: number;

  @IsString()
  button: string;

  @IsString()
  fabric: string;

  @IsString()
  design: string;

  @IsEnum(EPocketStyle)
  pocket: EPocketStyle;

  @IsEnum(ESewingType)
  sewing: ESewingType;

  @IsEnum(ESDType)
  sd: ESDType;

  @IsEnum(EPanType)
  pan: EPanType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}
