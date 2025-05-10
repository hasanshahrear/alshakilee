import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { InvoicesModule } from './invoices/invoices.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [LoggerModule, CustomerModule, InvoicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
