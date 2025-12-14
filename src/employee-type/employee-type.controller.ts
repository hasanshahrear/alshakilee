import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { EmployeeTypeService } from './employee-type.service';
import { CreateEmployeeTypeDto } from './dto/create-employee-type.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateEmployeeTypeDto } from './dto/update-employee-type.dto';

@Controller('employee-type')
export class EmployeeTypeController {
  constructor(private readonly employeeTypeService: EmployeeTypeService) {}

  // Create new employee type (protected)
  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createEmployeeTypeDto: CreateEmployeeTypeDto) {
    return this.employeeTypeService.create(createEmployeeTypeDto);
  }

  // Get all employee types (public)
  @Get()
  async findAll() {
    return this.employeeTypeService.findAll();
  }

  // Get employee type by id (public)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeTypeService.findOne(+id);
  }

  // Get employee type with count (public)
  @Get(':id/count')
  async getEmployeeCount(@Param('id') id: string) {
    return this.employeeTypeService.getEmployeeCount(+id);
  }

  // Update employee type (protected)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeTypeDto: UpdateEmployeeTypeDto,
  ) {
    return this.employeeTypeService.update(+id, updateEmployeeTypeDto);
  }

  // Delete employee type (protected)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.employeeTypeService.remove(+id);
  }
}
