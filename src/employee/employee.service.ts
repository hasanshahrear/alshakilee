import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpResponseService } from '../http-response/http-response.service';
import { LoggerService } from '../logger/logger.service';
import { HttpResponseException } from '../utils/exceptions';
import { processHttpError } from '../utils/helper';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeService {
  constructor(
    private prisma: PrismaService,
    private httpResponseService: HttpResponseService,
    private logger: LoggerService,
  ) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    try {
      const existingEmployee = await this.prisma.employee.findUnique({
        where: { email: createEmployeeDto.email },
      });

      if (existingEmployee) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.BAD_REQUEST,
            null,
            'Employee with this email already exists',
          ),
        );
      }

      // Check if employee type exists
      const employeeType = await this.prisma.employeeType.findUnique({
        where: { id: createEmployeeDto.employeeTypeId },
      });

      if (!employeeType) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.BAD_REQUEST,
            null,
            'Employee type does not exist',
          ),
        );
      }

      const result = await this.prisma.employee.create({
        data: createEmployeeDto,
        include: {
          employeeType: true,
        },
      });

      return this.httpResponseService.generate(HttpStatus.CREATED, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    status = true,
    queryString: string,
  ) {
    try {
      const offset = (page - 1) * limit;

      const searchFilter: Prisma.EmployeeTypeWhereInput | undefined =
        queryString
          ? {
              OR: [
                {
                  name: {
                    contains: queryString,
                  },
                },
              ],
            }
          : undefined;

      const [data, total] = await Promise.all([
        this.prisma.employeeType.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            id: 'desc',
          },
          where: {
            isActive: status,
            ...searchFilter,
          },
        }),
        this.prisma.employeeType.count({
          where: {
            isActive: status,
            ...searchFilter,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return this.httpResponseService.generate(HttpStatus.OK, {
        data,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async findOne(id: number) {
    try {
      const result = await this.prisma.employee.findUnique({
        where: { id },
        include: {
          employeeType: true,
        },
      });

      if (!result) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Employee not found',
          ),
        );
      }

      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
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
    try {
      const employee = await this.prisma.employee.findUnique({
        where: { id },
      });

      if (!employee) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Employee not found',
          ),
        );
      }

      const data: any = { ...updateEmployeeDto };

      // If status is being updated to APPROVED, set approvedAt
      if (updateEmployeeDto.status === 'APPROVED') {
        data.approvedAt = new Date();
      }

      const result = await this.prisma.employee.update({
        where: { id },
        data,
        include: {
          employeeType: true,
        },
      });

      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async remove(id: number) {
    try {
      await this.findOne(id);

      const result = await this.prisma.employee.delete({
        where: { id },
      });

      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async approveEmployee(id: number, approvedBy: string) {
    try {
      const result = await this.update(id, {
        status: 'APPROVED' as any,
        approvedBy,
      });

      return result;
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async rejectEmployee(
    id: number,
    rejectionReason: string,
    approvedBy: string,
  ) {
    try {
      const result = await this.update(id, {
        status: 'REJECTED' as any,
        rejectionReason,
        approvedBy,
      });

      return result;
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }
}
