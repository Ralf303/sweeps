import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
// import { UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
// import { WsAuthGuard } from './guards/ws-auth.guard';
// import { WsAdminGuard } from './guards/ws-admin.guard';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('message:send')
  // @UseGuards(WsAuthGuard)
  async handleMessage(
    @ConnectedSocket() client: any,
    @MessageBody() text: string,
  ) {
    const message = await this.chatService.createMessage({
      userId: client.user.sub,
      text,
    });
    this.server.emit('message:new', message);
  }

  @SubscribeMessage('message:delete')
  // @UseGuards(WsAuthGuard)
  async deleteMessage(
    @ConnectedSocket() client: any,
    @MessageBody() messageId: string,
  ) {
    await this.chatService.deleteMessage(messageId, client.user.sub);
    this.server.emit('message:deleted', messageId);
  }

  @SubscribeMessage('message:pin')
  // @UseGuards(WsAuthGuard, WsAdminGuard)
  async pinMessage(@MessageBody() messageId: string) {
    await this.chatService.pinMessage(messageId);
    this.server.emit('message:pinned', messageId);
  }

  @SubscribeMessage('clearChat')
  // @UseGuards(WsAuthGuard, WsAdminGuard)
  async handleClearChat() {
    const result = await this.chatService.clearChat();
    this.server.emit('chatCleared');
    return result;
  }
}
