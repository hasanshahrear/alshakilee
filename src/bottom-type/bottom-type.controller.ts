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
import { BottomTypeService } from './bottom-type.service';
import { CreateBottomTypeDto } from './dto/create-bottom-type.dto';
import {
  PatchBottomTypeDto,
  UpdateBottomTypeDto,
} from './dto/update-bottom-type.dto';

@Controller('bottom-type')
export class BottomTypeController {
  constructor(private readonly bottomTypeService: BottomTypeService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createBottomTypeDto: CreateBottomTypeDto) {
    return this.bottomTypeService.create(createBottomTypeDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status', new ParseBoolPipe()) status: boolean,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.bottomTypeService.findAll(pageNum, limitNum, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.bottomTypeService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBottomTypeDto: UpdateBottomTypeDto,
  ) {
    return this.bottomTypeService.update(+id, updateBottomTypeDto);
  }

  @Patch(':id')
  async remove(
    @Param('id') id: string,
    @Body() patchBottomTypeDto: PatchBottomTypeDto,
  ) {
    return this.bottomTypeService.remove(+id, patchBottomTypeDto);
  }
}
