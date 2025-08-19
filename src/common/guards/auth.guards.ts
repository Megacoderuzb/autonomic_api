import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { ROLES_KEY } from 'src/common/decorators/role.decorator';
import { Role } from 'src/common/enums/role.enum';
import { Request as ExpressRequest } from 'express';

interface JwtPayload {
  sub: string;
  role: Role;
}

interface AuthenticatedRequest extends ExpressRequest {
  user: JwtPayload;
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: process.env.JWT_SECRET,
      });

      request.user = payload;
      if (roles && !roles.includes(payload.role)) {
        throw new UnauthorizedException('Insufficient role');
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: ExpressRequest): string | null {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }
}
