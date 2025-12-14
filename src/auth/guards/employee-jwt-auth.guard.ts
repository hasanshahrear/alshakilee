import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { EmployeeService } from '../../employee/employee.service';

@Injectable()
export class EmployeeJwtAuthGuard
  extends AuthGuard('jwt')
  implements CanActivate
{
  constructor(private employeeService: EmployeeService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // First validate JWT
    const isValid = await super.canActivate(context);
    if (!isValid) {
      return false;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if user is an employee
    const employee = await this.employeeService.findOne(user.userId);

    if (!employee) {
      throw new UnauthorizedException('Employee not found');
    }

    // Check if employee is approved
    if (employee.status !== 'APPROVED') {
      throw new UnauthorizedException(
        `Your account status is ${employee.status}. Only approved employees can access this resource.`,
      );
    }

    // Check if employee is active
    if (!employee.isActive) {
      throw new UnauthorizedException('Your account has been deactivated');
    }

    // Attach employee to request
    request.employee = employee;

    return true;
  }
}
