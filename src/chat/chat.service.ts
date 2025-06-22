import { Injectable } from '@nestjs/common';
import { PaginationDto } from './dto/pagination.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async createMessage({
    userId,
    text,
    replyToId,
  }: {
    userId: string;
    text: string;
    replyToId?: string;
  }) {
    return this.prisma.chatMessage.create({
      data: {
        userId,
        text,
        replyToId,
      },
      include: {
        user: true,
        replyTo: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async deleteMessage(messageId: string, userId: string) {
    const message = await this.prisma.chatMessage.findUnique({
      where: { id: messageId },
    });

    if (message.userId !== userId) {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });
      if (user?.role !== 'admin') throw new Error('Unauthorized');
    }

    return this.prisma.chatMessage.delete({ where: { id: messageId } });
  }

  async pinMessage(messageId: string) {
    await this.prisma.chatMessage.updateMany({
      where: { isPin: true },
      data: { isPin: false },
    });

    return this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { isPin: true },
    });
  }

  async unpinMessage() {
    return this.prisma.chatMessage.updateMany({
      where: { isPin: true },
      data: { isPin: false },
    });
  }

  async loadMessages(pagination: PaginationDto) {
    const { skip = 0, take = 100 } = pagination;
    const messages = await this.prisma.chatMessage.findMany({
      orderBy: { createdAt: 'desc' },
      skip: Number(skip),
      take: Number(take),
      include: { user: true },
    });

    return messages;
  }
  async clearChat() {
    await this.prisma.chatMessage.deleteMany({});
    return { message: 'Chat cleared successfully.' };
  }

  async getPinnedMessage() {
    const pinnedMessage = await this.prisma.chatMessage.findFirst({
      where: { isPin: true },
      include: { user: true },
    });
    return pinnedMessage;
  }
}
