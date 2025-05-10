import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isValid, parseISO } from 'date-fns';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpResponseException } from 'src/utils/exceptions';
import { processHttpError } from 'src/utils/helper';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { PatchInvoiceDto, UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    private readonly httpResponseService: HttpResponseService,
    private readonly logger: LoggerService,
    private readonly _prisma: PrismaService,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const today = new Date().toISOString().split('T')[0];
    const [{ next_serial }] = await this._prisma.$queryRawUnsafe<
      { next_serial: number }[]
    >(`SELECT get_next_invoice_serial('${today}') AS next_serial;`);

    const yy = today.slice(2, 4);
    const mmdd = today.slice(5).replace('-', '');
    const serialStr = String(next_serial).padStart(4, '0');
    const invoiceNumber = `AST-${yy}${mmdd}${serialStr}`;

    try {
      await this._prisma.invoice.create({
        data: {
          invoiceNumber,
          invoiceDate: new Date().toISOString(),
          deliveryDate: new Date(createInvoiceDto.deliveryDate).toISOString(),
          customerId: createInvoiceDto.customerId,
          invoiceItems: {
            create: createInvoiceDto.items.map((item) => ({
              ...item,
            })),
          },
        },
      });

      return this.httpResponseService.generate(HttpStatus.CREATED, null);
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
    queryString?: string,
  ) {
    try {
      const offset = (page - 1) * limit;

      const whereClause: Prisma.InvoiceWhereInput = {
        isActive: status,
        ...(queryString && {
          OR: [
            {
              invoiceNumber: {
                contains: queryString,
              },
            },
            ...(isValid(parseISO(queryString))
              ? [
                  {
                    deliveryDate: {
                      equals: parseISO(queryString),
                    },
                  },
                  {
                    invoiceDate: {
                      equals: parseISO(queryString),
                    },
                  },
                ]
              : []),
            {
              customer: {
                mobile: {
                  contains: queryString,
                },
              },
            },
          ],
        }),
      };

      const [data, total] = await Promise.all([
        this._prisma.invoice.findMany({
          skip: offset,
          take: limit,
          orderBy: { id: 'desc' },
          where: whereClause,
          include: {
            customer: true,
            invoiceItems: true,
          },
        }),
        this._prisma.invoice.count({
          where: whereClause,
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
    return `This action returns a #${id} invoice`;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  async remove(id: number, patchInvoiceDto: PatchInvoiceDto) {
    try {
      const result = await this._prisma.invoice.update({
        where: {
          id: id,
        },
        data: {
          isActive: patchInvoiceDto?.isActive,
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
