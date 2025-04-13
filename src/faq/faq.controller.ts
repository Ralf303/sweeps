import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { FaqService } from './faq.service';

@ApiTags('Faq')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}

  @ApiOperation({ summary: 'Create a faq (Admin only)' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
      },
    },
  })
  @UseGuards(AdminGuard)
  @Post()
  createFaq(@Body() body: any) {
    return this.faqService.createFaq(body);
  }

  @ApiOperation({ summary: 'Get all faq' })
  @Get()
  getAllFaq() {
    return this.faqService.getAllFaq();
  }

  @ApiOperation({ summary: 'Delete a faq (Admin only)' })
  @UseGuards(AdminGuard)
  @Delete(':id')
  deleteFaq(@Param('id') id: string) {
    return this.faqService.deleteFaq(id);
  }
}
