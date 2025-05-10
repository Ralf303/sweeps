// ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    let token: string | undefined =
      client.handshake.auth?.token || client.handshake.headers.authorization;

    if (!token) {
      throw new WsException('Missing token');
    }

    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      console.log('WsAuthGuard', payload);

      client.user = payload;
      return true;

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: any) {
      throw new WsException('Invalid token');
    }
  }
}
