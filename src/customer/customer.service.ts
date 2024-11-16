import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCustomerDto } from './dtos/createCustomer.dtos';

@Injectable()
export class CustomerService {
  constructor(private _prisma: PrismaService) {}
  async createCustomer(
    customer: CreateCustomerDto,
  ): Promise<CreateCustomerDto> {
    return this._prisma.customer.create({
      data: customer,
    });
  }
}
