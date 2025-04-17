import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { PaginationDto } from './dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(createChatDto: CreateChatDto) {
    console.log('Sending message:', createChatDto);

    const newMessage = await this.prisma.chatMessage.create({
      data: {
        userId: createChatDto.userId,
        text: createChatDto.text,
      },
      include: {
        user: true,
      },
    });
    return newMessage;
  }

  async loadMessages(pagination: PaginationDto) {
    console.log('Loading messages with pagination:', pagination);
    const { skip = 0, take = 100 } = pagination;
    const messages = await this.prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(take),
      include: { user: true },
    });

    return messages;
  }

  // async clearChat(userId: string) {
  //   console.log('Clearing chat for user:', userId);
  //   const user = await this.prisma.user.findUnique({
  //     where: { id: userId },
  //   });
  //   if (!user || user.role !== 'admin') {
  //     throw new UnauthorizedException('Only admins can clear the chat.');
  //   }
  //   await this.prisma.chatMessage.deleteMany({});
  //   return { message: 'Chat cleared successfully.' };
  // }

  async deleteMessage(messageId: string, userId: string) {
    console.log('Deleting message:', messageId, 'for user:', userId);
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });
    if (!message) {
      throw new Error('Message not found');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found.');
    }

    if (user.role !== 'admin' && message.userId !== userId) {
      throw new UnauthorizedException(
        'You are not authorized to delete this message.',
      );
    }

    await this.prisma.chatMessage.delete({
      where: { id: messageId },
    });
    return { message: 'Message deleted successfully.' };
  }
}
