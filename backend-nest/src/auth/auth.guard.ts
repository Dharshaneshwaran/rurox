import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { Request } from 'express';
import type { AuthUser } from './auth.types';

const jwtSecret = process.env.JWT_SECRET ?? 'change_me';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request & { user?: AuthUser }>();
    const header = req.headers.authorization;
    if (!header) {
      throw new UnauthorizedException('Missing token');
    }

    const token = header.replace('Bearer ', '').trim();
    try {
      const decoded = jwt.verify(token, jwtSecret) as AuthUser;
      req.user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
