import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpResponseException } from 'src/utils/exceptions';
import { processHttpError } from 'src/utils/helper';
import { CreateBottomTypeDto } from './dto/create-bottom-type.dto';
import {
  PatchBottomTypeDto,
  UpdateBottomTypeDto,
} from './dto/update-bottom-type.dto';

@Injectable()
export class BottomTypeService {
  constructor(
    private readonly httpResponseService: HttpResponseService,
    private readonly logger: LoggerService,
    private readonly _prisma: PrismaService,
  ) {}
  async create(createBottomTypeDto: CreateBottomTypeDto) {
    try {
      const result = await this._prisma.bottomType.create({
        data: createBottomTypeDto,
      });
      return this.httpResponseService.generate(HttpStatus.CREATED, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10, status = true) {
    try {
      const offset = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this._prisma.bottomType.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            id: 'desc',
          },
          where: {
            isActive: status,
          },
        }),
        this._prisma.bottomType.count({
          where: {
            isActive: status,
          },
        }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return this.httpResponseService.generate(HttpStatus.OK, {
        data,
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

  async findOne(id: number) {
    try {
      const result = await this._prisma.bottomType.findFirst({
        where: {
          id: id,
        },
      });

      if (!result) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Button Type not found',
          ),
        );
      }

      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async update(id: number, updateBottomTypeDto: UpdateBottomTypeDto) {
    try {
      const result = await this._prisma.bottomType.update({
        where: {
          id: id,
        },
        data: updateBottomTypeDto,
      });
      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async remove(id: number, patchBottomTypeDto: PatchBottomTypeDto) {
    try {
      const result = await this._prisma.bottomType.update({
        where: {
          id: id,
        },
        data: {
          isActive: patchBottomTypeDto?.isActive,
        },
      });
      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }
}
