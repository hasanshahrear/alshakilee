import { PartialType } from '@nestjs/mapped-types';
import { CreateDesignTypeDto } from './create-design-type.dto';

export class UpdateDesignTypeDto extends PartialType(CreateDesignTypeDto) {}
