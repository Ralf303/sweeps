import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CryptoService {
  constructor(private prisma: PrismaService) {}

  private apiUrl = 'https://app.alphapo.net/api/v2/invoices/create';
  private apiKey = process.env.ALPHAPO_API_KEY;
  private secretKey = process.env.ALPHAPO_SECRET_KEY;

  private generateSignature(body: object): string {
    const jsonBody = JSON.stringify(body);
    return crypto
      .createHmac('sha512', this.secretKey)
      .update(jsonBody)
      .digest('hex');
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const payload = {
      foreign_id: dto.foreign_id,
      amount: dto.amount.toString(),
      currency: dto.currency,
      title: dto.title,
      description: dto.description || 'Balance top-up',
      url_success: dto.url_success,
      url_failed: dto.url_failed,
      ...(dto.sender_currency && { sender_currency: dto.sender_currency }),
      ...(dto.email_user && { email_user: dto.email_user }),
      ...(dto.timer !== undefined && { timer: dto.timer }),
    };

    const signature = this.generateSignature(payload);

    const response = await axios.post(this.apiUrl, payload, {
      headers: {
        'X-Processing-Key': this.apiKey,
        'X-Processing-Signature': signature,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async handleCallback(data: any) {
    const amount = parseFloat(data.amount);

    await this.prisma.user.update({
      where: { id: data.foreign_id },
      data: { balance: { increment: amount } },
    });
  }
}
