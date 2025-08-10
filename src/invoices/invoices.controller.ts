import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createInvoiceDto: CreateInvoiceDto) {
    return this.invoicesService.create(createInvoiceDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status') status: string,
    @Query('queryString') queryString?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.invoicesService.findAll(
      pageNum,
      limitNum,
      status,
      queryString,
    );
  }

  @Get('get-upcoming-delivery-order-list')
  async getUpcomingDeliveryOrderList() {
    return this.invoicesService.getUpcomingDeliveryOrderList();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.invoicesService.findOne(+id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.invoicesService.update(+id, updateInvoiceDto);
  }

  @Patch('/status/:id')
  async updateStatus(@Param('id') id: string, @Body('status') status: number) {
    return this.invoicesService.updateStatus(+id, status);
  }

  @Patch('/delivery-date-update/:id')
  async updateDeliveryDate(
    @Param('id') id: string,
    @Body('deliveryDate') deliveryDate: Date,
  ) {
    return this.invoicesService.updateDeliveryDate(+id, deliveryDate);
  }

  @Patch(':id')
  async remove(@Param('id') id: string) {
    return this.invoicesService.remove(+id);
  }
}
