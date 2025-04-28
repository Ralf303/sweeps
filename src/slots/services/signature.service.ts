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
    // Логирование входящих данных
    console.log('[DEBUG] Received headers:', headers);
    console.log('[DEBUG] Received body:', body);
    console.log('[DEBUG] Received signature:', receivedSign);

    // 1. Фильтрация заголовков
    const signatureHeaders = {
      'x-merchant-id': headers['x-merchant-id']?.toString(),
      'x-timestamp': headers['x-timestamp']?.toString(),
      'x-nonce': headers['x-nonce']?.toString(),
    };

    // Проверка наличия обязательных заголовков
    if (
      !signatureHeaders['x-merchant-id'] ||
      !signatureHeaders['x-timestamp'] ||
      !signatureHeaders['x-nonce']
    ) {
      console.error('[ERROR] Missing required headers');
      return false;
    }

    // 2. Объединение параметров
    const mergedParams = {
      ...body,
      ...signatureHeaders,
    };
    console.log('[DEBUG] Merged params:', mergedParams);

    // 3. Сортировка параметров
    const sortedParams = this.sortParams(mergedParams);
    console.log('[DEBUG] Sorted params:', sortedParams);

    // 4. Создание query string
    const queryString = this.buildQueryString(sortedParams);
    console.log('[DEBUG] Query string:', queryString);

    // 5. Генерация подписи
    const expectedSign = crypto
      .createHmac('sha1', this.merchantKey)
      .update(queryString)
      .digest('hex');

    console.log('[DEBUG] Expected signature:', expectedSign);
    console.log('[DEBUG] Signature match:', expectedSign === receivedSign);

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
