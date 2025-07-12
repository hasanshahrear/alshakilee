import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly httpResponseService: HttpResponseService,
    private readonly logger: LoggerService,
    private readonly _prisma: PrismaService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = await this._prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
    });
    return this.httpResponseService.generate(HttpStatus.CREATED, user);
  }

  async findAll() {
    const users = await this._prisma.user.findMany();
    return this.httpResponseService.generate(HttpStatus.OK, users);
  }

  async findByPhone(phone: string) {
    return this._prisma.user.findUnique({
      where: { phone },
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
      const user = await this._prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
      return this.httpResponseService.generate(HttpStatus.OK, user);
    } catch (error) {
      this.logger.error(`Failed to update user #${id}: ${error.message}`);
      return this.httpResponseService.generate(HttpStatus.BAD_REQUEST, {
        message: error.message,
      });
    }
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
