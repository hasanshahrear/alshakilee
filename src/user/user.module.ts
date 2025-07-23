import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { LoggerModule } from 'src/logger/logger.module';
import { HttpResponseModule } from 'src/http-response/http-response.module';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  controllers: [UserController],
  providers: [UserService],
  imports: [LoggerModule, HttpResponseModule, PrismaModule],
  exports: [UserService],
})
export class UserModule {}
