import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';

@Injectable()
export class EmployeeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    // Check if employee already exists
    const existingEmployee = await this.prisma.employee.findUnique({
      where: { email: createEmployeeDto.email },
    });

    if (existingEmployee) {
      throw new BadRequestException('Employee with this email already exists');
    }

    // Check if employee type exists
    const employeeType = await this.prisma.employeeType.findUnique({
      where: { id: createEmployeeDto.employeeTypeId },
    });

    if (!employeeType) {
      throw new BadRequestException('Employee type does not exist');
    }

    return this.prisma.employee.create({
      data: createEmployeeDto,
      include: {
        employeeType: true,
      },
    });
  }

  async findAll(status?: string, isActive?: boolean) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    return this.prisma.employee.findMany({
      where,
      include: {
        employeeType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.employee.findUnique({
      where: { id },
      include: {
        employeeType: true,
      },
    });
  }

  async findByEmail(email: string) {
    return this.prisma.employee.findUnique({
      where: { email },
      include: {
        employeeType: true,
      },
    });
  }

  async findByGoogleId(googleId: string) {
    return this.prisma.employee.findUnique({
      where: { googleId },
      include: {
        employeeType: true,
      },
    });
  }

  async update(id: number, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new BadRequestException('Employee not found');
    }

    const data: any = { ...updateEmployeeDto };

    // If status is being updated to APPROVED, set approvedAt
    if (updateEmployeeDto.status === 'APPROVED') {
      data.approvedAt = new Date();
    }

    return this.prisma.employee.update({
      where: { id },
      data,
      include: {
        employeeType: true,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.employee.delete({
      where: { id },
    });
  }

  async approveEmployee(id: number, approvedBy: string) {
    return this.update(id, {
      status: 'APPROVED' as any,
      approvedBy,
    });
  }

  async rejectEmployee(
    id: number,
    rejectionReason: string,
    approvedBy: string,
  ) {
    return this.update(id, {
      status: 'REJECTED' as any,
      rejectionReason,
      approvedBy,
    });
  }
}
