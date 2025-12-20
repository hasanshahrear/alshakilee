import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { processHttpError } from 'src/utils/helper';
import { HttpResponseException } from 'src/utils/exceptions';
import { Prisma } from '@prisma/client';

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

  async findAll(
    page: number = 1,
    limit: number = 10,
    status = true,
    queryString: string,
  ) {
    try {
      const offset = (page - 1) * limit;

      const searchFilter: Prisma.UserWhereInput | undefined = queryString
        ? {
            OR: [
              {
                phone: {
                  contains: queryString,
                },
              },
              {
                name: {
                  contains: queryString,
                },
              },
            ],
          }
        : undefined;

      const [data, total] = await Promise.all([
        this._prisma.user.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            id: 'desc',
          },
          where: {
            isActive: status,
            ...searchFilter,
          },
        }),
        this._prisma.user.count({
          where: {
            isActive: status,
            ...searchFilter,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      const filteredData = data?.map(({ password, ...rest }) => rest);

      return this.httpResponseService.generate(HttpStatus.OK, {
        data: filteredData,
        meta: {
          total,
          page,
          limit,
          totalPages,
        },
      });
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
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
