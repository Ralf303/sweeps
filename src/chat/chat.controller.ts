import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('Chat')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @ApiOperation({ summary: 'Get paginated chat messages (latest first)' })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
    description: 'How many messages to skip',
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
    description: 'How many messages to take',
  })
  @Get('messages')
  async getMessages(
    @Query('skip') skip?: number,
    @Query('take') take?: number,
  ) {
    return await this.chatService.loadMessages({ skip, take });
  }

  @ApiOperation({ summary: 'Get pinned message' })
  @Get('pinned')
  async getPinnedMessage() {
    return await this.chatService.getPinnedMessage();
  }
}
