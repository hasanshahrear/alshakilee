import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Query,
  HttpCode,
  HttpStatus,
  Request,
  ParseBoolPipe,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employee')
@UseGuards(JwtAuthGuard)
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
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
    return await this.employeeService.findAll(
      pageNum,
      limitNum,
      status,
      queryString,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req,
  ) {
    if (!updateEmployeeDto.approvedBy) {
      updateEmployeeDto.approvedBy = req.user.email;
    }
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  @Put(':id/approve')
  async approveEmployee(@Param('id') id: string, @Request() req) {
    return this.employeeService.approveEmployee(+id, req.user.email);
  }

  @Put(':id/reject')
  async rejectEmployee(
    @Param('id') id: string,
    @Body('rejectionReason') rejectionReason: string,
    @Request() req,
  ) {
    return this.employeeService.rejectEmployee(
      +id,
      rejectionReason,
      req.user.email,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
