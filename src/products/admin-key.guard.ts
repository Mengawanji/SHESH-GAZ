import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('DASHBOARD_API_KEY');
    if (!expected) {
      throw new ServiceUnavailableException('DASHBOARD_API_KEY is not set.');
    }

    const request = context.switchToHttp().getRequest();
    const provided = request.headers['x-admin-key'] ?? request.query?.key;

    if (!provided || provided !== expected) {
      throw new UnauthorizedException('Invalid dashboard API key.');
    }

    return true;
  }
}
