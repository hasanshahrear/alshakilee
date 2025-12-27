import { Module } from '@nestjs/common';
import { EmployeeTypeService } from './employee-type.service';
import { EmployeeTypeController } from './employee-type.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { HttpResponseModule } from '../http-response/http-response.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  controllers: [EmployeeTypeController],
  providers: [EmployeeTypeService],
  imports: [PrismaModule, HttpResponseModule, LoggerModule],
  exports: [EmployeeTypeService],
})
export class EmployeeTypeModule {}
