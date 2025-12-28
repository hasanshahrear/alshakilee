import { Module } from '@nestjs/common';
import { InvoiceTrackingService } from './invoice-tracking.service';
import { InvoiceTrackingController } from './invoice-tracking.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HttpResponseModule } from 'src/http-response/http-response.module';
import { LoggerModule } from 'src/logger/logger.module';

@Module({
  imports: [PrismaModule, HttpResponseModule, LoggerModule],
  controllers: [InvoiceTrackingController],
  providers: [InvoiceTrackingService],
  exports: [InvoiceTrackingService],
})
export class InvoiceTrackingModule {}
