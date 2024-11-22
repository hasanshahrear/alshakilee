import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

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
      const result = await this._prisma.$transaction(async (prisma) => {
        for (const item of createInvoiceDto?.items || []) {
          const insertedItem = await prisma.invoiceItem.create({
            data: {
              ...item,
              invoiceId: null,
              customerId: createInvoiceDto?.customerId,
            },
          });
          insertedInvoiceItems.push(insertedItem?.id);
        }

        console.log({ insertedInvoiceItems });

        const insertedInvoice = await prisma.invoice.create({
          data: {
            deliveryDate: new Date(
              createInvoiceDto?.deliveryDate,
            ).toISOString(),
            invoiceNumber: new Date().toISOString(),
            customerId: createInvoiceDto?.customerId,
            invoiceItemsIds: insertedInvoiceItems,
            invoiceDate: new Date().toISOString(),
          },
        });
        console.log({ insertedInvoice });
      });

      // Return the result with HTTP response
      return this.httpResponseService.generate(HttpStatus.CREATED, result);
    } catch (error) {
      console.error('Transaction Error:', error);
      throw this.httpResponseService.generate(
        HttpStatus.INTERNAL_SERVER_ERROR,
        null,
        'Failed to create item and invoice list',
      );
    }
  }
  // return 'This action adds a new invoice';
  // }

  async findAll() {
    return `This action returns all invoices`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} invoice`;
  }

  async update(id: number, updateInvoiceDto: UpdateInvoiceDto) {
    return `This action updates a #${id} invoice`;
  }

  async remove(id: number) {
    return `This action removes a #${id} invoice`;
  }
}
