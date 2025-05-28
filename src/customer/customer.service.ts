import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpResponseException } from 'src/utils/exceptions';
import { processHttpError } from 'src/utils/helper';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PatchCustomerDto, UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    private readonly httpResponseService: HttpResponseService,
    private readonly logger: LoggerService,
    private readonly _prisma: PrismaService,
  ) {}

  async create(createCustomerDto: CreateCustomerDto) {
    try {
      const result = await this._prisma.customer.create({
        data: createCustomerDto,
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

      const searchFilter: Prisma.CustomerWhereInput | undefined = queryString
        ? {
            OR: [
              {
                mobile: {
                  contains: queryString,
                },
              },
              {
                name: {
                  contains: queryString,
                },
              },
            ],
          }
        : undefined;

      const [data, total] = await Promise.all([
        this._prisma.customer.findMany({
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
        this._prisma.customer.count({
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
      const result = await this._prisma.customer.findFirst({
        where: {
          id: id,
        },
      });

      if (!result) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Customer not found',
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

  async findByMobile(mobile: string) {
    try {
      let customers;
      if (mobile) {
        customers = await this._prisma.customer.findMany({
          where: {
            mobile: {
              contains: mobile,
            },
            isActive: true,
          },
          orderBy: {
            id: 'desc',
          },
        });
      } else {
        customers = await this._prisma.customer.findMany({
          where: {
            isActive: true,
          },
          take: 6,
          orderBy: {
            id: 'desc',
          },
        });
      }

      if (!customers || customers.length === 0) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Customer not found',
          ),
        );
      }

      return this.httpResponseService.generate(HttpStatus.OK, customers);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto) {
    try {
      const result = await this._prisma.customer.update({
        where: {
          id: id,
        },
        data: updateCustomerDto,
      });
      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async remove(id: number, patchCustomerDto: PatchCustomerDto) {
    try {
      const result = await this._prisma.customer.update({
        where: {
          id: id,
        },
        data: {
          isActive: patchCustomerDto?.isActive,
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
