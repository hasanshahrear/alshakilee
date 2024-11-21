import { Module } from '@nestjs/common';
import { HttpResponseModule } from 'src/http-response/http-response.module';
import { LoggerModule } from 'src/logger/logger.module';
import { PrismaModule } from 'src/prisma/prisma.module';
import { DesignTypeController } from './design-type.controller';
import { DesignTypeService } from './design-type.service';

@Module({
  imports: [LoggerModule, HttpResponseModule, PrismaModule],
  controllers: [DesignTypeController],
  providers: [DesignTypeService],
})
export class DesignTypeModule {}
