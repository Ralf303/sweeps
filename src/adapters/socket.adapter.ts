import { IoAdapter } from '@nestjs/platform-socket.io';

// main.ts
export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, options);
    server.on(
      'connection',
      (socket: { id: any; handshake: { auth: any; headers: any } }) => {
        console.log(`Client connected: ${socket.id}`);
        console.log('Auth headers:', socket.handshake.auth);
        console.log('Regular headers:', socket.handshake.headers);
      },
    );
    return server;
  }
}
