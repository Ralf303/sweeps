import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/live', path: '/live' })
export class LiveGateway {
  @WebSocketServer()
  server: Server;

  sendLiveBetNotification(data: {
    gameName: string;
    imageSrc: string;
    amount: number;
  }) {
    console.log('Вошли в функцию');

    this.server.emit('live_bet', data);
    console.log('Отправили событие', data);
  }
}
