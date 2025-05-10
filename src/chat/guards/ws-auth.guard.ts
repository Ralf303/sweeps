// ws-auth.guard.ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class WsAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient();
    console.log('Client:', client); // Для дебага

    // Получаем токен из двух возможных источников
    const token =
      client.handshake.auth?.token ||
      client.handshake.headers.authorization?.split(' ')[1];

    if (!token) throw new WsException('Missing token');

    console.log('Extracted token:', token); // Для дебага
    console.log('JWT_SECRET:', process.env.JWT_SECRET); // Проверка секрета

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'super-secret-key',
      });

      client.user = payload;
      return true;
    } catch (e) {
      console.error('JWT verification error:', e);
      throw new WsException('Invalid token');
    }
  }
}
