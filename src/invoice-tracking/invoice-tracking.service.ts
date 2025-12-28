import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { HttpResponseService } from 'src/http-response/http-response.service';
import { LoggerService } from 'src/logger/logger.service';
import { HttpResponseException } from 'src/utils/exceptions';
import { CreateInvoiceTrackingDto } from './dto/create-invoice-tracking.dto';
import { PaginationInvoiceTrackingDto } from './dto/pagination-invoice-tracking.dto';

@Injectable()
export class InvoiceTrackingService {
  constructor(
    private readonly _prisma: PrismaService,
    private readonly httpResponseService: HttpResponseService,
    private readonly logger: LoggerService,
  ) {}

  /**
   * Scan and assign employee type to invoice with business logic
   * Conditions:
   * 1. Same employee type id can't be assigned under same invoice id
   * 2. If scan finds already assigned same employee type - show error
   * 3. If scan finds already assigned but different employee type - update other to "done" and create new as "pending"
   * 4. If scan finds nothing - create with "pending" status
   * 5. If current user already has this invoice - don't create and show error
   */
  async scanAndAssign(scanDto: CreateInvoiceTrackingDto) {
    try {
      const { invoiceId, employeeTypeId, changedBy } = scanDto;
      const currentUserId = scanDto.userId;

      // Validate that invoice exists
      const invoice = await this._prisma.invoice.findUnique({
        where: { id: invoiceId },
      });

      if (!invoice) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Invoice not found',
            'Invoice not found',
          ),
        );
      }

      // Validate that employee type exists
      const employeeType = await this._prisma.employeeType.findUnique({
        where: { id: employeeTypeId },
      });

      if (!employeeType) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.NOT_FOUND,
            null,
            'Employee type not found',
            'Employee type not found',
          ),
        );
      }

      // CONDITION 5: Check if current user already has assignment in this invoice
      const currentUserAssignment =
        await this._prisma.invoiceTracking.findFirst({
          where: {
            invoiceId,
            userId: currentUserId,
          },
        });

      if (currentUserAssignment) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.CONFLICT,
            null,
            'You are already assigned to this invoice.',
            'You are already assigned to this invoice.',
          ),
        );
      }

      // Check for existing assignments of this employee type for this invoice
      const existingAssignment = await this._prisma.invoiceTracking.findFirst({
        where: {
          invoiceId,
          employeeTypeId,
        },
        include: {
          user: true,
          employeeType: true,
        },
      });

      // CONDITION 1 & 2: If same employee type already assigned to this invoice
      if (existingAssignment) {
        throw new HttpResponseException(
          this.httpResponseService.generate(
            HttpStatus.CONFLICT,
            null,
            `This employee type (${employeeType.name}) is already assigned to this invoice. Same employee type cannot be assigned twice to the same invoice.`,
            `This employee type (${employeeType.name}) is already assigned to this invoice. Same employee type cannot be assigned twice to the same invoice.`,
          ),
        );
      }

      // CONDITION 3: Check if there's any OTHER employee type assigned but not done
      const otherEmployeeAssignment =
        await this._prisma.invoiceTracking.findFirst({
          where: {
            invoiceId,
            employeeTypeId: { not: employeeTypeId },
            status: { not: 'done' },
          },
          orderBy: {
            changedAt: 'desc',
          },
        });

      // If other employee type exists, update it to "done"
      if (otherEmployeeAssignment) {
        await this._prisma.invoiceTracking.update({
          where: { id: otherEmployeeAssignment.id },
          data: {
            status: 'done',
            changedAt: new Date(),
            changedBy,
          },
        });
      }

      // CONDITION 4: Create new assignment with "pending" status
      const newTracking = await this._prisma.invoiceTracking.create({
        data: {
          invoiceId,
          userId: currentUserId,
          employeeTypeId,
          status: 'pending',
          changedAt: new Date(),
          changedBy,
        },
      });

      return this.httpResponseService.generate(
        HttpStatus.CREATED,
        newTracking,
        'Invoice tracking assigned successfully',
      );
    } catch (error) {
      this.logger.error(
        `Error in scanAndAssign: ${error.message}`,
        error.stack,
      );

      if (error instanceof HttpResponseException) {
        throw error;
      }

      throw new HttpResponseException(
        this.httpResponseService.generate(
          HttpStatus.INTERNAL_SERVER_ERROR,
          null,
          'Failed to scan and assign invoice tracking',
          'Failed to scan and assign invoice tracking',
        ),
      );
    }
  }

  /**
   * Find all invoice tracking records with pagination and filters
   */
  async findAll(paginationDto: PaginationInvoiceTrackingDto) {
    try {
      const {
        page = 1,
        limit = 10,
        userId,
        employeeTypeId,
        status,
      } = paginationDto;
      const offset = (page - 1) * limit;

      // Build where clause based on filters
      const whereClause: any = {};

      if (userId) {
        whereClause.userId = userId;
      }

      if (employeeTypeId) {
        whereClause.employeeTypeId = employeeTypeId;
      }

      if (status) {
        whereClause.status = status;
      }

      const [data, total] = await Promise.all([
        this._prisma.invoiceTracking.findMany({
          skip: offset,
          take: limit,
          orderBy: { changedAt: 'desc' },
          where: whereClause,
          include: {
            invoice: {
              include: {
                customer: true,
                invoiceItems: true,
              },
            },
            user: true,
            employeeType: true,
          },
        }),
        this._prisma.invoiceTracking.count({
          where: whereClause,
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
      this.logger.error(`Error in findAll: ${error.message}`, error.stack);

      throw new HttpResponseException(
        this.httpResponseService.generate(
          HttpStatus.INTERNAL_SERVER_ERROR,
          null,
          'Failed to retrieve invoice tracking records',
          'Failed to retrieve invoice tracking records',
        ),
      );
    }
  }

  /**
   * Scan and assign employee type to invoice with business logic
   * Conditions:
   * 1. Same employee type id can't be assigned under same invoice id
   * 2. If scan finds already assigned same employee type - show error
   * 3. If scan finds already assigned but different employee type - update other to "done" and create new as "pending"
   * 4. If scan finds nothing - create with "pending" status
   * 5. If current user already has this invoice - don't create and show error
   */
  // async scanAndAssignOld(scanDto: CreateInvoiceTrackingDto) {
  //   try {
  //     // Validate that invoice exists
  //     const invoice = await this._prisma.invoice.findUnique({
  //       where: { id: createDto.invoiceId },
  //     });

  //     if (!invoice) {
  //       throw new HttpResponseException(
  //         'Invoice not found',
  //         HttpStatus.NOT_FOUND,
  //         'INVOICE_NOT_FOUND',
  //       );
  //     }

  //     // Validate that user exists
  //     const user = await this._prisma.user.findUnique({
  //       where: { id: createDto.userId },
  //     });

  //     if (!user) {
  //       throw new HttpResponseException(
  //         'User not found',
  //         HttpStatus.NOT_FOUND,
  //         'USER_NOT_FOUND',
  //       );
  //     }

  //     // Validate that employee type exists
  //     const employeeType = await this._prisma.employeeType.findUnique({
  //       where: { id: createDto.employeeTypeId },
  //     });

  //     if (!employeeType) {
  //       throw new HttpResponseException(
  //         'Employee type not found',
  //         HttpStatus.NOT_FOUND,
  //         'EMPLOYEE_TYPE_NOT_FOUND',
  //       );
  //     }

  //     // Check for duplicate assignment
  //     const existingAssignment = await this._prisma.invoiceTracking.findFirst({
  //       where: {
  //         invoiceId: createDto.invoiceId,
  //         employeeTypeId: createDto.employeeTypeId,
  //       },
  //     });

  //     if (existingAssignment) {
  //       throw new HttpResponseException(
  //         'Same employee type is already assigned to this invoice',
  //         HttpStatus.CONFLICT,
  //         'EMPLOYEE_TYPE_ALREADY_ASSIGNED',
  //       );
  //     }

  //     const tracking = await this._prisma.invoiceTracking.create({
  //       data: {
  //         invoiceId: createDto.invoiceId,
  //         userId: createDto.userId,
  //         employeeTypeId: createDto.employeeTypeId,
  //         status: createDto.status,
  //         changedAt: new Date(),
  //         changedBy: createDto.changedBy,
  //       },
  //       include: {
  //         invoice: true,
  //         user: true,
  //         employeeType: true,
  //       },
  //     });

  //     this.logger.info(
  //       `Invoice tracking created: Invoice ${createDto.invoiceId}`,
  //     );

  //     return this.httpResponseService.success(
  //       'Invoice tracking created successfully',
  //       tracking,
  //       HttpStatus.CREATED,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error in create: ${error.message}`, error.stack);

  //     if (error instanceof HttpResponseException) {
  //       throw error;
  //     }

  //     throw new HttpResponseException(
  //       'Failed to create invoice tracking',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'INTERNAL_ERROR',
  //     );
  //   }
  // }

  // /**
  //  * Find all tracking records for an invoice
  //  */
  // async findByInvoice(invoiceId: number) {
  //   try {
  //     const invoice = await this._prisma.invoice.findUnique({
  //       where: { id: invoiceId },
  //     });

  //     if (!invoice) {
  //       throw new HttpResponseException(
  //         'Invoice not found',
  //         HttpStatus.NOT_FOUND,
  //         'INVOICE_NOT_FOUND',
  //       );
  //     }

  //     const trackings = await this._prisma.invoiceTracking.findMany({
  //       where: { invoiceId },
  //       include: {
  //         user: true,
  //         employeeType: true,
  //       },
  //       orderBy: {
  //         changedAt: 'desc',
  //       },
  //     });

  //     return this.httpResponseService.success(
  //       'Invoice trackings retrieved successfully',
  //       trackings,
  //       HttpStatus.OK,
  //     );
  //   } catch (error) {
  //     this.logger.error(
  //       `Error in findByInvoice: ${error.message}`,
  //       error.stack,
  //     );

  //     if (error instanceof HttpResponseException) {
  //       throw error;
  //     }

  //     throw new HttpResponseException(
  //       'Failed to retrieve invoice trackings',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'INTERNAL_ERROR',
  //     );
  //   }
  // }

  // /**
  //  * Find all tracking records for a user
  //  */
  // async findByUser(userId: number) {
  //   try {
  //     const user = await this._prisma.user.findUnique({
  //       where: { id: userId },
  //     });

  //     if (!user) {
  //       throw new HttpResponseException(
  //         'User not found',
  //         HttpStatus.NOT_FOUND,
  //         'USER_NOT_FOUND',
  //       );
  //     }

  //     const trackings = await this._prisma.invoiceTracking.findMany({
  //       where: { userId },
  //       include: {
  //         invoice: true,
  //         employeeType: true,
  //       },
  //       orderBy: {
  //         changedAt: 'desc',
  //       },
  //     });

  //     return this.httpResponseService.success(
  //       'User invoice trackings retrieved successfully',
  //       trackings,
  //       HttpStatus.OK,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error in findByUser: ${error.message}`, error.stack);

  //     if (error instanceof HttpResponseException) {
  //       throw error;
  //     }

  //     throw new HttpResponseException(
  //       'Failed to retrieve user invoice trackings',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'INTERNAL_ERROR',
  //     );
  //   }
  // }

  // /**
  //  * Find a specific tracking record
  //  */
  // async findOne(id: number) {
  //   try {
  //     const tracking = await this._prisma.invoiceTracking.findUnique({
  //       where: { id },
  //       include: {
  //         invoice: true,
  //         user: true,
  //         employeeType: true,
  //       },
  //     });

  //     if (!tracking) {
  //       throw new HttpResponseException(
  //         'Invoice tracking not found',
  //         HttpStatus.NOT_FOUND,
  //         'TRACKING_NOT_FOUND',
  //       );
  //     }

  //     return this.httpResponseService.success(
  //       'Invoice tracking retrieved successfully',
  //       tracking,
  //       HttpStatus.OK,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error in findOne: ${error.message}`, error.stack);

  //     if (error instanceof HttpResponseException) {
  //       throw error;
  //     }

  //     throw new HttpResponseException(
  //       'Failed to retrieve invoice tracking',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'INTERNAL_ERROR',
  //     );
  //   }
  // }

  // /**
  //  * Update tracking status
  //  */
  // async update(id: number, updateDto: UpdateInvoiceTrackingDto) {
  //   try {
  //     const tracking = await this._prisma.invoiceTracking.findUnique({
  //       where: { id },
  //     });

  //     if (!tracking) {
  //       throw new HttpResponseException(
  //         'Invoice tracking not found',
  //         HttpStatus.NOT_FOUND,
  //         'TRACKING_NOT_FOUND',
  //       );
  //     }

  //     const updated = await this._prisma.invoiceTracking.update({
  //       where: { id },
  //       data: {
  //         status: updateDto.status,
  //         changedAt: new Date(),
  //         changedBy: updateDto.changedBy,
  //       },
  //       include: {
  //         invoice: true,
  //         user: true,
  //         employeeType: true,
  //       },
  //     });

  //     this.logger.info(`Invoice tracking updated: ID ${id}`);

  //     return this.httpResponseService.success(
  //       'Invoice tracking updated successfully',
  //       updated,
  //       HttpStatus.OK,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error in update: ${error.message}`, error.stack);

  //     if (error instanceof HttpResponseException) {
  //       throw error;
  //     }

  //     throw new HttpResponseException(
  //       'Failed to update invoice tracking',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'INTERNAL_ERROR',
  //     );
  //   }
  // }

  // /**
  //  * Delete tracking record
  //  */
  // async remove(id: number) {
  //   try {
  //     const tracking = await this._prisma.invoiceTracking.findUnique({
  //       where: { id },
  //     });

  //     if (!tracking) {
  //       throw new HttpResponseException(
  //         'Invoice tracking not found',
  //         HttpStatus.NOT_FOUND,
  //         'TRACKING_NOT_FOUND',
  //       );
  //     }

  //     const deleted = await this._prisma.invoiceTracking.delete({
  //       where: { id },
  //     });

  //     this.logger.info(`Invoice tracking deleted: ID ${id}`);

  //     return this.httpResponseService.success(
  //       'Invoice tracking deleted successfully',
  //       deleted,
  //       HttpStatus.OK,
  //     );
  //   } catch (error) {
  //     this.logger.error(`Error in remove: ${error.message}`, error.stack);

  //     if (error instanceof HttpResponseException) {
  //       throw error;
  //     }

  //     throw new HttpResponseException(
  //       'Failed to delete invoice tracking',
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //       'INTERNAL_ERROR',
  //     );
  //   }
  // }
}
