import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDesignTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
