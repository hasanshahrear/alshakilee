import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeTypeDto } from './dto/create-employee-type.dto';
import { UpdateEmployeeTypeDto } from './dto/update-employee-type.dto';

@Injectable()
export class EmployeeTypeService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeTypeDto: CreateEmployeeTypeDto) {
    // Check if employee type already exists
    const existingType = await this.prisma.employeeType.findUnique({
      where: { name: createEmployeeTypeDto.name },
    });

    if (existingType) {
      throw new BadRequestException(
        'Employee type with this name already exists',
      );
    }

    return this.prisma.employeeType.create({
      data: createEmployeeTypeDto,
      include: {
        employees: true,
      },
    });
  }

  async findAll() {
    return this.prisma.employeeType.findMany({
      include: {
        employees: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: number) {
    const employeeType = await this.prisma.employeeType.findUnique({
      where: { id },
      include: {
        employees: true,
      },
    });

    if (!employeeType) {
      throw new BadRequestException('Employee type not found');
    }

    return employeeType;
  }

  async findByName(name: string) {
    return this.prisma.employeeType.findUnique({
      where: { name },
      include: {
        employees: true,
      },
    });
  }

  async update(id: number, updateEmployeeTypeDto: UpdateEmployeeTypeDto) {
    const employeeType = await this.findOne(id);

    // Check if new name is unique (if name is being updated)
    if (
      updateEmployeeTypeDto.name &&
      updateEmployeeTypeDto.name !== employeeType.name
    ) {
      const existingType = await this.prisma.employeeType.findUnique({
        where: { name: updateEmployeeTypeDto.name },
      });

      if (existingType) {
        throw new BadRequestException(
          'Employee type with this name already exists',
        );
      }
    }

    return this.prisma.employeeType.update({
      where: { id },
      data: updateEmployeeTypeDto,
      include: {
        employees: true,
      },
    });
  }

  async remove(id: number) {
    const employeeType = await this.findOne(id);

    // Check if any employees are using this type
    if (employeeType.employees.length > 0) {
      throw new BadRequestException(
        `Cannot delete employee type with ${employeeType.employees.length} active employee(s)`,
      );
    }

    return this.prisma.employeeType.delete({
      where: { id },
    });
  }

  async getEmployeeCount(id: number) {
    const employeeType = await this.findOne(id);
    return {
      id: employeeType.id,
      name: employeeType.name,
      employeeCount: employeeType.employees.length,
      employees: employeeType.employees,
    };
  }
}
