import { HttpStatus, Injectable } from '@nestjs/common';
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
    const insertedInvoiceItems: number[] = [];
    try {
      await this._prisma.$transaction(async (prisma) => {
        for (const item of createInvoiceDto?.items || []) {
          const insertedItem = await prisma.invoiceItem.create({
            data: {
              ...item,
              customerId: createInvoiceDto?.customerId,
            },
          });
          insertedInvoiceItems.push(insertedItem?.id);
        }

        await prisma.invoice.create({
          data: {
            invoiceNumber: new Date().toISOString(),
            invoiceDate: new Date().toISOString(),
            deliveryDate: new Date(
              createInvoiceDto?.deliveryDate,
            ).toISOString(),
            customerId: createInvoiceDto?.customerId,
            invoiceItemsIds: insertedInvoiceItems,
          },
        });
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
    queryString: string,
  ) {
    try {
      const offset = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this._prisma.invoice.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            id: 'desc',
          },
          where: {
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
                          equals: new Date(queryString),
                        },
                      },
                      {
                        invoiceDate: {
                          equals: new Date(queryString),
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
          },
          include: {
            customer: true,
          },
        }),
        this._prisma.invoice.count({
          where: {
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
                          equals: new Date(queryString),
                        },
                      },
                      {
                        invoiceDate: {
                          equals: new Date(queryString),
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
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const invoicesWithItems = await Promise.all(
        data.map(async (invoice) => {
          const invoiceItems = await this._prisma.invoiceItem.findMany({
            where: {
              id: {
                in: invoice.invoiceItemsIds as number[],
              },
            },
          });

          return {
            ...invoice,
            items: invoiceItems,
          };
        }),
      );

      return this.httpResponseService.generate(HttpStatus.OK, {
        data: invoicesWithItems,
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
