import { HttpException } from '@nestjs/common';
import { HttpResponse } from '../interfaces';

//==================================================================================================
/**
 * implements http exception with http response from the service of common module
 */
export class HttpResponseException extends HttpException {
  /**
   * Http response exception contructor
   * @param data Http response
   */
  constructor(data: HttpResponse) {
    super(
      HttpException.createBody('', data.description, data.status),
      data.status,
    );
  }
}

//==================================================================================================
