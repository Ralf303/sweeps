import { Injectable } from '@nestjs/common';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import axios from 'axios';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import Decimal from 'decimal.js';

@Injectable()
export class CryptoService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  private apiUrl =
    'https://app.sandbox.cryptoprocessing.com/api/v2/invoices/create';
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
    try {
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

      const invoiceData = {
        userId: dto.foreign_id,
        amount: dto.amount,
        currency: dto.currency,
      };

      await this.redis.setInvoice(dto.foreign_id, invoiceData);

      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  async getCurrencyRate() {
    const currencies = await this.prisma.cryptoCurrency.findMany({
      where: {},
    });

    return currencies;
  }

  async updateCurrencyRate(id: number, rate: number) {
    const currency = await this.prisma.cryptoCurrency.findUnique({
      where: { id },
    });

    if (!currency) {
      throw new Error('Currency not found');
    }

    await this.prisma.cryptoCurrency.update({
      where: { id },
      data: { symbol: rate },
    });
  }

  async handleCallback(data: any) {
    const foreignId = data?.crypto_address?.foreign_id;
    const status = data?.status;

    if (!foreignId || status !== 'confirmed') return;

    const invoice = await this.redis.getInvoice(foreignId);
    if (!invoice) return;

    await this.prisma.crypto.create({
      data: {
        id: data.id,
        user: foreignId,
        amount: new Decimal(data.currency_received.amount),
        currency: data.currency_received.currency,
        status: 'confirmed',
        senderAmount: data.currency_sent?.amount
          ? new Decimal(data.currency_sent.amount)
          : undefined,
        senderCurrency: data.currency_sent?.currency || undefined,
        rawData: data,
      },
    });

    await this.prisma.user.update({
      where: { id: foreignId },
      data: {
        balance: {
          increment: Number(data.currency_received.amount),
        },
      },
    });

    await this.redis.deleteInvoice(foreignId);
  }
}
