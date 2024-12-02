import { Module } from '@nestjs/common';
import { HttpResponseModule } from 'src/http-response/http-response.module';
import { LoggerModule } from 'src/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { BottomTypeController } from './bottom-type.controller';
import { BottomTypeService } from './bottom-type.service';

@Module({
  imports: [LoggerModule, HttpResponseModule, PrismaModule],
  controllers: [BottomTypeController],
  providers: [BottomTypeService],
})
export class BottomTypeModule {}
