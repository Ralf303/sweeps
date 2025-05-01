import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { WebhookGuard } from './guards/webhook-signature.guard';

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

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
