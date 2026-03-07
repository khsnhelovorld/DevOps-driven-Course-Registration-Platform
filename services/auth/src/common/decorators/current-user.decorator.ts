import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../users/user.entity';

export interface JwtPayload {
  sub: string;
  studentId: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext): User | string => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as User;
    return (data ? user?.[data] : user) as User | string;
  },
);
