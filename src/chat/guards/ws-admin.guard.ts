import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

@Injectable()
export class WsAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    const user = client.user;

    if (user?.role !== 'admin' && user?.role !== 'moderator') {
      throw new WsException('Admin access required');
    }
    return true;
  }
}
