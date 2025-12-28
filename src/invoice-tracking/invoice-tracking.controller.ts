import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { InvoiceTrackingService } from './invoice-tracking.service';
import { ScanInvoiceTrackingDto } from './dto/scan-invoice-tracking.dto';
import { CreateInvoiceTrackingDto } from './dto/create-invoice-tracking.dto';
import { UpdateInvoiceTrackingDto } from './dto/update-invoice-tracking.dto';
import { PaginationInvoiceTrackingDto } from './dto/pagination-invoice-tracking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('invoice-tracking')
@UseGuards(JwtAuthGuard)
export class InvoiceTrackingController {
  constructor(
    private readonly invoiceTrackingService: InvoiceTrackingService,
  ) {}

  @Post('scan')
  @HttpCode(HttpStatus.CREATED)
  async scanAndAssign(@Body() scanDto: CreateInvoiceTrackingDto) {
    return this.invoiceTrackingService.scanAndAssign(scanDto);
  }

  /**
   * Get all tracking records with pagination and filters
   * GET /invoice-tracking?page=1&limit=10&userId=1&employeeTypeId=2&status=pending
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() paginationDto: PaginationInvoiceTrackingDto) {
    return this.invoiceTrackingService.findAll(paginationDto);
  }

  // /**
  //  * Create invoice tracking manually
  //  * POST /invoice-tracking
  //  */
  // @Post()
  // @HttpCode(HttpStatus.CREATED)
  // async create(@Body() createDto: CreateInvoiceTrackingDto) {
  //   return this.invoiceTrackingService.create(createDto);
  // }

  // /**
  //  * Get all tracking records for a specific invoice
  //  * GET /invoice-tracking/invoice/:invoiceId
  //  */
  // @Get('invoice/:invoiceId')
  // @HttpCode(HttpStatus.OK)
  // async findByInvoice(@Param('invoiceId') invoiceId: string) {
  //   return this.invoiceTrackingService.findByInvoice(parseInt(invoiceId, 10));
  // }

  // /**
  //  * Get all tracking records for a specific user
  //  * GET /invoice-tracking/user/:userId
  //  */
  // @Get('user/:userId')
  // @HttpCode(HttpStatus.OK)
  // async findByUser(@Param('userId') userId: string) {
  //   return this.invoiceTrackingService.findByUser(parseInt(userId, 10));
  // }

  // /**
  //  * Get a specific tracking record
  //  * GET /invoice-tracking/:id
  //  */
  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // async findOne(@Param('id') id: string) {
  //   return this.invoiceTrackingService.findOne(parseInt(id, 10));
  // }

  // /**
  //  * Update tracking record status
  //  * PUT /invoice-tracking/:id
  //  */
  // @Put(':id')
  // @HttpCode(HttpStatus.OK)
  // async update(
  //   @Param('id') id: string,
  //   @Body() updateDto: UpdateInvoiceTrackingDto,
  // ) {
  //   return this.invoiceTrackingService.update(parseInt(id, 10), updateDto);
  // }

  // /**
  //  * Delete tracking record
  //  * DELETE /invoice-tracking/:id
  //  */
  // @Delete(':id')
  // @HttpCode(HttpStatus.OK)
  // async remove(@Param('id') id: string) {
  //   return this.invoiceTrackingService.remove(parseInt(id, 10));
  // }
}
