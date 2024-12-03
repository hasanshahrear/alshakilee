import { PartialType } from '@nestjs/mapped-types';
import { IsBoolean } from 'class-validator';
import { CreateDesignTypeDto } from './create-design-type.dto';

export class UpdateDesignTypeDto extends PartialType(CreateDesignTypeDto) {}
export class PatchDesignTypeDto extends PartialType(CreateDesignTypeDto) {
  @IsBoolean()
  isActive?: boolean;
}
