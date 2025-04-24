import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CryptoService {
  constructor(private prisma: PrismaService) {}

  private apiUrl = 'https://api.alphapo.net/invoices/create';
  private apiKey = '<YOUR_PUBLIC_KEY>';
  private apiSecret = '<YOUR_SECRET_KEY>';

  private generateSignature(body: object): string {
    const jsonBody = JSON.stringify(body);
    return crypto
      .createHmac('sha512', this.apiSecret)
      .update(jsonBody)
      .digest('hex');
  }

  async createInvoice(dto: CreateInvoiceDto) {
    const payload = {
      foreign_id: dto.userId,
      amount: dto.amount,
      currency: dto.currency,
      description: dto.description || 'Balance top-up',
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
