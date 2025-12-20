import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
  Query,
  ParseBoolPipe,
  Patch,
} from '@nestjs/common';
import { EmployeeTypeService } from './employee-type.service';
import { CreateEmployeeTypeDto } from './dto/create-employee-type.dto';
import {
  PatchEmployeeTypeDto,
  UpdateEmployeeTypeDto,
} from './dto/update-employee-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employee-type')
@UseGuards(JwtAuthGuard)
export class EmployeeTypeController {
  constructor(private readonly employeeTypeService: EmployeeTypeService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeTypeDto: CreateEmployeeTypeDto) {
    return this.employeeTypeService.create(createEmployeeTypeDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status', new ParseBoolPipe()) status: boolean,
    @Query('queryString') queryString?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.employeeTypeService.findAll(
      pageNum,
      limitNum,
      status,
      queryString,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeTypeService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeTypeDto: UpdateEmployeeTypeDto,
  ) {
    return this.employeeTypeService.update(+id, updateEmployeeTypeDto);
  }

  @Patch(':id')
  async remove(
    @Param('id') id: string,
    @Body() patchEmployeeTypeDto: PatchEmployeeTypeDto,
  ) {
    return this.employeeTypeService.remove(+id, patchEmployeeTypeDto);
  }
}
