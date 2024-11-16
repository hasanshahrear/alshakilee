import {
  Body,
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dtos/createCustomer.dtos';

@Controller('customer')
export class CustomerController {
  constructor(private _customerService: CustomerService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createCustomer(@Body() customer: CreateCustomerDto) {
    return this._customerService.createCustomer(customer);
  }
}
