import {
  Body,
  Controller,
  Get,
  Param,
  ParseBoolPipe,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { DesignTypeService } from './design-type.service';
import { CreateDesignTypeDto } from './dto/create-design-type.dto';
import {
  PatchDesignTypeDto,
  UpdateDesignTypeDto,
} from './dto/update-design-type.dto';

@Controller('design-type')
export class DesignTypeController {
  constructor(private readonly designTypeService: DesignTypeService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createDesignTypeDto: CreateDesignTypeDto) {
    return this.designTypeService.create(createDesignTypeDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status', new ParseBoolPipe()) status: boolean,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.designTypeService.findAll(pageNum, limitNum, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.designTypeService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDesignTypeDto: UpdateDesignTypeDto,
  ) {
    return this.designTypeService.update(+id, updateDesignTypeDto);
  }

  @Patch(':id')
  async remove(
    @Param('id') id: string,
    @Body() patchDesignTypeDto: PatchDesignTypeDto,
  ) {
    return this.designTypeService.remove(+id, patchDesignTypeDto);
  }
}
