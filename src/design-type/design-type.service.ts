import { HttpStatus, Injectable } from '@nestjs/common';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpResponseException } from 'src/utils/exceptions';
import { processHttpError } from 'src/utils/helper';
import { CreateDesignTypeDto } from './dto/create-design-type.dto';
import { UpdateDesignTypeDto } from './dto/update-design-type.dto';

@Injectable()
export class DesignTypeService {
  constructor(
    private readonly httpResponseService: HttpResponseService,
    private readonly logger: LoggerService,
    private readonly _prisma: PrismaService,
  ) {}
  async create(createDesignTypeDto: CreateDesignTypeDto) {
    try {
      const result = await this._prisma.design.create({
        data: createDesignTypeDto,
      });
      return this.httpResponseService.generate(HttpStatus.CREATED, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async findAll(page: number = 1, limit: number = 10) {
    try {
      const offset = (page - 1) * limit;

      const [data, total] = await Promise.all([
        this._prisma.design.findMany({
          skip: offset,
          take: limit,
          orderBy: {
            id: 'desc',
          },
        }),
        this._prisma.design.count(),
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
      const result = await this._prisma.design.findFirst({
        where: {
          id: id,
        },
      });

      if (!result) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Design Type not found',
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

  async update(id: number, updateDesignTypeDto: UpdateDesignTypeDto) {
    try {
      const result = await this._prisma.design.update({
        where: {
          id: id,
        },
        data: updateDesignTypeDto,
      });
      return this.httpResponseService.generate(HttpStatus.OK, result);
    } catch (error) {
      processHttpError(error, this.logger);
      throw new HttpResponseException(
        this.httpResponseService.generate(HttpStatus.INTERNAL_SERVER_ERROR),
      );
    }
  }

  async remove(id: number) {
    return `This action removes a #${id} designType`;
  }
}
