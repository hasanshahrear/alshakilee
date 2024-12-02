import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class CreateBottomTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  isActive?: boolean;
}
