import { PartialType } from '@nestjs/mapped-types';
import { CreateBottomTypeDto } from './create-bottom-type.dto';

export class UpdateBottomTypeDto extends CreateBottomTypeDto {}
export class PatchBottomTypeDto extends PartialType(CreateBottomTypeDto) {}
