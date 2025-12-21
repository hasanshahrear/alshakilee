import { Injectable, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { HttpResponseService } from '../http-response/http-response.service';
import { LoggerService } from '../logger/logger.service';
import { HttpResponseException } from '../utils/exceptions';
import { processHttpError } from '../utils/helper';
import { CreateEmployeeTypeDto } from './dto/create-employee-type.dto';
import {
  PatchEmployeeTypeDto,
  UpdateEmployeeTypeDto,
} from './dto/update-employee-type.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class EmployeeTypeService {
  constructor(
    private prisma: PrismaService,
    private httpResponseService: HttpResponseService,
    private logger: LoggerService,
  ) {}

  async create(createEmployeeTypeDto: CreateEmployeeTypeDto) {
    try {
      const existingType = await this.prisma.employeeType.findUnique({
        where: { name: createEmployeeTypeDto.name },
      });

      if (existingType) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.BAD_REQUEST,
            null,
            'Employee type with this name already exists',
          ),
        );
      }

      const result = await this.prisma.employeeType.create({
        data: createEmployeeTypeDto,
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
      const result = await this.prisma.employeeType.findUnique({
        where: { id },
      });

      if (!result) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Employee type not found',
          ),
        );
      }

      return result;
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async findByName(name: string) {
    return this.prisma.employeeType.findUnique({
      where: { name },
    });
  }

  async update(id: number, updateEmployeeTypeDto: UpdateEmployeeTypeDto) {
    try {
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
          throw new HttpResponseException(
            this.httpResponseService.generate(
              HttpStatus.BAD_REQUEST,
              null,
              'Employee type with this name already exists',
            ),
          );
        }
      }

      const result = await this.prisma.employeeType.update({
        where: { id },
        data: updateEmployeeTypeDto,
      });

      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async remove(id: number, patchEmployeeTypeDto: PatchEmployeeTypeDto) {
    try {
      const result = await this.prisma.employeeType.update({
        where: {
          id: id,
        },
        data: {
          isActive: patchEmployeeTypeDto?.isActive,
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
}
