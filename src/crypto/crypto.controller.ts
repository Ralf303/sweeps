import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { WebhookGuard } from './guards/webhook-signature.guard';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Post('invoice')
  createInvoice(@Body() dto: CreateInvoiceDto) {
    return this.cryptoService.createInvoice(dto);
  }

  @Post('webhook/invoice')
  @UseGuards(WebhookGuard)
  async handleWebhook(@Body() data: any) {
    await this.cryptoService.handleCallback(data);
    return { status: 'ok' };
  }
}
