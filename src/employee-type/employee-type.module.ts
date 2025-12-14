import { Module } from '@nestjs/common';
import { EmployeeTypeService } from './employee-type.service';
import { EmployeeTypeController } from './employee-type.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [EmployeeTypeController],
  providers: [EmployeeTypeService],
  imports: [PrismaModule],
  exports: [EmployeeTypeService],
})
export class EmployeeTypeModule {}
