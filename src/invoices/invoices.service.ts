import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { isValid, parseISO } from 'date-fns';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpResponseException } from 'src/utils/exceptions';
import { processHttpError } from 'src/utils/helper';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { EStatus } from 'src/utils/enums/status.enum';

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
          customerId: createInvoiceDto?.customerId,
          totalPrice: createInvoiceDto?.totalPrice,
          advanceAmount: createInvoiceDto?.advanceAmount,
          discountAmount: createInvoiceDto?.discountAmount,
          balanceAmount: createInvoiceDto?.totalPrice
            ? createInvoiceDto?.totalPrice -
              (createInvoiceDto?.advanceAmount || 0) -
              (createInvoiceDto?.discountAmount || 0)
            : 0,
          totalQuantity: createInvoiceDto?.items?.reduce(
            (acc, item) => acc + (item?.quantity || 0),
            0,
          ),
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

  async findAll(page: number = 1, limit: number = 10, queryString?: string) {
    try {
      const offset = (page - 1) * limit;

      const whereClause: Prisma.InvoiceWhereInput = {
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
    const invoice = await this._prisma.invoice.findUnique({
      where: {
        id: id,
      },
      include: {
        customer: true,
        invoiceItems: true,
      },
    });
    if (!invoice) {
      throw new HttpResponseException(
        this.httpResponseService.generate(
          HttpStatus.NOT_FOUND,
          null,
          'Invoice not found',
        ),
      );
    }
    return this.httpResponseService.generate(HttpStatus.OK, invoice);
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    try {
      const existingInvoice = await this._prisma.invoice.findUnique({
        where: { id },
        include: { invoiceItems: true },
      });

      if (!existingInvoice) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Invoice not found',
          ),
        );
      }

      const payloadItemIds = updateInvoiceDto.items
        .filter((item) => item.id)
        .map((item) => item.id);

      const existingItemIds = existingInvoice.invoiceItems.map(
        (item) => item.id,
      );

      const itemsToDelete = existingItemIds.filter(
        (itemId) => !payloadItemIds.includes(itemId),
      );

      const itemsToUpdate = updateInvoiceDto.items.filter(
        (item) => item.id && existingItemIds.includes(item.id),
      );

      const itemsToCreate = updateInvoiceDto.items.filter((item) => !item.id);

      // 1. Update main invoice
      await this._prisma.invoice.update({
        where: { id },
        data: {
          invoiceDate: new Date().toISOString(),
          deliveryDate: updateInvoiceDto.deliveryDate
            ? new Date(updateInvoiceDto.deliveryDate).toISOString()
            : undefined,
          customerId: updateInvoiceDto.customerId,
          totalPrice: updateInvoiceDto?.totalPrice,
          advanceAmount: updateInvoiceDto?.advanceAmount,
          discountAmount: updateInvoiceDto?.discountAmount,
          balanceAmount: updateInvoiceDto?.totalPrice
            ? updateInvoiceDto?.totalPrice -
              (updateInvoiceDto?.advanceAmount || 0) -
              (updateInvoiceDto?.discountAmount || 0)
            : 0,
          totalQuantity: updateInvoiceDto?.items?.reduce(
            (acc, item) => acc + (item?.quantity || 0),
            0,
          ),
        },
      });

      // 2. Delete removed items
      if (itemsToDelete.length) {
        await this._prisma.invoiceItem.deleteMany({
          where: { id: { in: itemsToDelete } },
        });
      }

      // 3. Update existing items
      await Promise.all(
        itemsToUpdate.map((item) =>
          this._prisma.invoiceItem.update({
            where: { id: item.id },
            data: {
              ...item,
              invoiceId: id,
            },
          }),
        ),
      );

      // 4. Create new items
      if (itemsToCreate.length) {
        await this._prisma.invoiceItem.createMany({
          data: itemsToCreate.map((item) => ({
            ...item,
            invoiceId: id,
          })),
        });
      }

      return this.httpResponseService.generate(
        HttpStatus.OK,
        null,
        'Invoice updated successfully',
      );
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async updateStatus(id: number, status: number) {
    try {
      const result = await this._prisma.invoice.update({
        where: {
          id: id,
        },
        data: {
          status: status,
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
      const result = await this._prisma.invoice.update({
        where: {
          id: id,
        },
        data: {
          status: EStatus.Cancelled,
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
