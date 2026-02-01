import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { InvoicesModule } from './invoices/invoices.module';
import { LoggerModule } from './logger/logger.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EmployeeTypeModule } from './employee-type/employee-type.module';
import { InvoiceTrackingModule } from './invoice-tracking/invoice-tracking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.prod', '.env'],
    }),
    LoggerModule,
    CustomerModule,
    InvoicesModule,
    UserModule,
    AuthModule,
    EmployeeTypeModule,
    InvoiceTrackingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
