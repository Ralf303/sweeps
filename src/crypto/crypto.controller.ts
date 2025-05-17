import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { WebhookGuard } from './guards/webhook-signature.guard';
import { AdminGuard } from 'src/auth/guards/admin.guard';
import { UpdateCurriencyDto } from './dto/update.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@ApiTags('crypto')
@UseGuards(JwtAuthGuard)
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @ApiOperation({ summary: 'Получение курса валют' })
  @ApiResponse({ status: 200, description: 'Курс валют' })
  @Get('currency')
  async getCurrencyRate() {
    return await this.cryptoService.getCurrencyRate();
  }

  @ApiOperation({ summary: 'Обновить ссылку социальной сети по ID' })
  @ApiParam({
    name: 'id',
    description: 'ID социальной ссылки',
    example: 1,
    type: Number,
  })
  @ApiBody({
    description: 'DTO с URL для обновления',
    type: UpdateCurriencyDto,
    examples: {
      example1: {
        value: { url: 'https://new-url.com' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Обновленная социальная ссылка',
    type: UpdateCurriencyDto,
  })
  @UseGuards(AdminGuard)
  @Put(':id')
  async updateSocialLink(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCurriencyDto,
  ): Promise<any> {
    return this.cryptoService.updateCurrencyRate(id, dto.rate);
  }

  @ApiOperation({ summary: 'Создание инвойса' })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({ status: 201, description: 'Инвойс успешно создан.' })
  @ApiResponse({ status: 400, description: 'Некорректный ввод данных.' })
  @Post('invoice')
  async createInvoice(@Body() dto: CreateInvoiceDto) {
    return await this.cryptoService.createInvoice(dto);
  }

  @Post('webhook/invoice')
  @UseGuards(WebhookGuard)
  async handleWebhook(@Body() data: any) {
    console.log('Webhook received:', data);
    await this.cryptoService.handleCallback(data);
    return { status: 'ok' };
  }
}
