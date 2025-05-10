import { IoAdapter } from '@nestjs/platform-socket.io';

// main.ts
export class CustomIoAdapter extends IoAdapter {
  createIOServer(port: number, options?: any) {
    const server = super.createIOServer(port, {
      ...options,
      cors: {
        origin: ['https://sweeps.website'],
        methods: ['GET', 'POST'],
        credentials: true,
      },
      allowEIO3: true, // Для совместимости с старыми клиентами
    });

    server.on('connection', (socket: { id: any; handshake: { auth: any } }) => {
      console.log(`New connection: ${socket.id}`);
      console.log('Auth:', socket.handshake.auth);
    });

    return server;
  }
}
