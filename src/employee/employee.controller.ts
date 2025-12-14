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
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  // Register new employee (public - no guard)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.create(createEmployeeDto);
  }

  // Get all employees (admin only - protected)
  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('status') status?: string,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.employeeService.findAll(status, isActive);
  }

  // Get pending employees (admin only)
  @Get('pending')
  @UseGuards(JwtAuthGuard)
  async findPending() {
    return this.employeeService.findAll('PENDING');
  }

  // Get employee by id (admin only)
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.employeeService.findOne(+id);
  }

  // Update employee (admin only)
  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateEmployeeDto: UpdateEmployeeDto,
    @Request() req,
  ) {
    // Set the approvedBy field to current user if not provided
    if (!updateEmployeeDto.approvedBy) {
      updateEmployeeDto.approvedBy = req.user.email;
    }
    return this.employeeService.update(+id, updateEmployeeDto);
  }

  // Approve employee (admin only)
  @Put(':id/approve')
  @UseGuards(JwtAuthGuard)
  async approveEmployee(@Param('id') id: string, @Request() req) {
    return this.employeeService.approveEmployee(+id, req.user.email);
  }

  // Reject employee (admin only)
  @Put(':id/reject')
  @UseGuards(JwtAuthGuard)
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

  // Delete employee (admin only)
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: string) {
    return this.employeeService.remove(+id);
  }
}
