import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthService, type AuthenticatedUser } from './auth.service';

type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};

@Injectable()
export class CognitoAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    request.user = await this.authService.getIdentityFromAuthorizationHeader(
      request.headers.authorization,
    );
    if (!request.user) {
      throw new UnauthorizedException('Authentication failed.');
    }
    return true;
  }
}
