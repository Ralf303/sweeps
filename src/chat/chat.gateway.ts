import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { Server } from 'socket.io';

@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  @SubscribeMessage('sendMessage')
  async handleSendMessage(@MessageBody() createChatDto: CreateChatDto) {
    const message = await this.chatService.sendMessage(createChatDto);
    this.server.emit('newMessage', message);
    return message;
  }

  @SubscribeMessage('clearChat')
  async handleClearChat(@MessageBody() payload: { userId: string }) {
    const result = await this.chatService.clearChat(payload.userId);
    this.server.emit('chatCleared');
    return result;
  }
}
