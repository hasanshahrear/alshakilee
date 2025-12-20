import { Module } from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { EmployeeController } from './employee.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpResponseModule } from '../http-response/http-response.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  controllers: [EmployeeController],
  providers: [EmployeeService],
  imports: [PrismaModule, HttpResponseModule, LoggerModule],
  exports: [EmployeeService],
})
export class EmployeeModule {}
