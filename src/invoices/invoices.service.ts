import { HttpStatus, Injectable } from '@nestjs/common';
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

  async findAll() {
    return `This action returns all invoices`;
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
