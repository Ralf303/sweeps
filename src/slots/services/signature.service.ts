import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class SignatureService {
  private readonly merchantId = '527abef289b4fe339407d448206adc63';
  private readonly merchantKey = 'a70a4fd3efc11ff31f013112b501ac8062ac8415';

  generateHeaders(params: Record<string, any> = {}): {
    headers: any;
    signature: string;
  } {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');

    const headers = {
      'X-Merchant-Id': this.merchantId,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce,
    };

    const mergedParams = { ...params, ...headers };
    const sortedParams = this.sortParams(mergedParams);
    const hashString = new URLSearchParams(sortedParams).toString();

    const signature = crypto
      .createHmac('sha1', this.merchantKey)
      .update(hashString)
      .digest('hex');

    return {
      headers: {
        ...headers,
        'X-Sign': signature,
      },
      signature,
    };
  }

  validateSignature(
    body: Record<string, any>,
    headers: Record<string, string>,
    receivedSign: string,
  ): boolean {
    // 1. Фильтруем и нормализуем заголовки
    const signatureHeaders = {
      'X-Merchant-Id': headers['x-merchant-id']?.toString() || '',
      'X-Timestamp': headers['x-timestamp']?.toString() || '',
      'X-Nonce': headers['x-nonce']?.toString() || '',
    };

    // 2. Объединяем параметры с учетом регистра ключей
    const mergedParams = {
      ...this.normalizeKeys(body),
      ...this.normalizeKeys(signatureHeaders),
    };

    // 3. Сортируем и создаем query string
    const sortedParams = this.sortParams(mergedParams);
    const queryString = this.buildQueryString(sortedParams);

    // 4. Вычисляем подпись
    const expectedSign = crypto
      .createHmac('sha1', this.merchantKey)
      .update(queryString)
      .digest('hex');

    return expectedSign === receivedSign;
  }

  private normalizeKeys(obj: Record<string, any>): Record<string, any> {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key.toLowerCase()] = obj[key];
      return acc;
    }, {});
  }

  private sortParams(params: Record<string, any>): Record<string, any> {
    return Object.keys(params)
      .sort()
      .reduce((sorted, key) => {
        sorted[key] = params[key];
        return sorted;
      }, {});
  }

  private buildQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => {
        const encodedValue = encodeURIComponent(value.toString());
        return `${key}=${encodedValue}`;
      })
      .join('&');
  }
}
