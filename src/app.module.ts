import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CustomerModule } from './customer/customer.module';
import { DesignTypeModule } from './design-type/design-type.module';
import { LoggerModule } from './logger/logger.module';
import { BottomTypeModule } from './bottom-type/bottom-type.module';

@Module({
  imports: [LoggerModule, CustomerModule, DesignTypeModule, BottomTypeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
