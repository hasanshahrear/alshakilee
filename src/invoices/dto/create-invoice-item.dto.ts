import { IsEnum, IsInt, IsNumber, IsPositive, Min } from 'class-validator';

export enum PocketStyle {
  P2 = 'P2',
  P2_Bag = 'P2_Bag',
}

export enum SewingType {
  Chap = 'Chap',
  Lock = 'Lock',
}

export enum SDType {
  SD = 'SD',
  No_SD = 'No_SD',
}

export class CreateItemDto {
  @IsInt()
  @IsPositive()
  designTypeId: number;

  @IsInt()
  @IsPositive()
  bottomTypeId: number;

  @IsInt()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @Min(0)
  length: number;

  @IsNumber()
  @Min(0)
  shoulder: number;

  @IsNumber()
  @Min(0)
  hand: number;

  @IsNumber()
  @Min(0)
  handLouse: number;

  @IsNumber()
  @Min(0)
  neck: number;

  @IsNumber()
  @Min(0)
  neckLouse: number;

  @IsNumber()
  @Min(0)
  centreLouse: number;

  @IsEnum(PocketStyle)
  pocketStyle: PocketStyle;

  @IsEnum(SewingType)
  sewingType: SewingType;

  @IsEnum(SDType)
  sdType: SDType;
}
