import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
import { CreateBottomTypeDto } from './create-bottom-type.dto';

export class UpdateBottomTypeDto extends CreateBottomTypeDto {}
export class PatchBottomTypeDto extends PartialType(CreateBottomTypeDto) {
  @IsBoolean()
  isActive?: boolean;
}
