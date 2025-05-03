import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/live', path: '/live' })
export class LiveGateway {
  @WebSocketServer()
  server: Server;

  sendLiveBetNotification(data: {
    gameName: string;
    playerName: string;
    amount: number;
  }) {
    this.server.emit('live_bet', data);
  }
}
