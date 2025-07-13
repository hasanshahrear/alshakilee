import {
  Body,
  Controller,
  Delete,
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
import { HttpResponseService } from 'src/http-response/http-response.service';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { PatchCustomerDto, UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('customer')
@UseGuards(JwtAuthGuard)
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly httpResponseService: HttpResponseService,
  ) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async create(@Body() createCustomerDto: CreateCustomerDto) {
    return this.customerService.create(createCustomerDto);
  }

  @Get()
  async findAll(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('status', new ParseBoolPipe()) status: boolean,
    @Query('queryString') queryString?: string,
  ) {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return await this.customerService.findAll(
      pageNum,
      limitNum,
      status,
      queryString,
    );
  }

  @Get('mobile')
  async findByMobile(@Query('mobile') mobile?: string) {
    return this.customerService.findByMobile(mobile);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.customerService.findOne(+id);
  }

  @Put(':id')
  @UsePipes(new ValidationPipe())
  async update(
    @Param('id') id: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
  ) {
    return this.customerService.update(+id, updateCustomerDto);
  }

  @Patch(':id')
  async remove(
    @Param('id') id: string,
    @Body() patchCustomerDto: PatchCustomerDto,
  ) {
    return this.customerService.remove(+id, patchCustomerDto);
  }
}
