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
    const normalizedHeaders = {
      'x-merchant-id': headers['x-merchant-id'] || headers['X-Merchant-Id'],
      'x-timestamp': headers['x-timestamp'] || headers['X-Timestamp'],
      'x-nonce': headers['x-nonce'] || headers['X-Nonce'],
    };

    if (
      !normalizedHeaders['x-merchant-id'] ||
      !normalizedHeaders['x-timestamp'] ||
      !normalizedHeaders['x-nonce']
    ) {
      return false;
    }

    // Используем ключи заголовков в том регистре, как указано в документации (X-...)
    const signingData = {
      ...body,
      'X-Merchant-Id': normalizedHeaders['x-merchant-id'],
      'X-Timestamp': normalizedHeaders['x-timestamp'],
      'X-Nonce': normalizedHeaders['x-nonce'],
    };

    const sortedParams = this.sortParams(signingData);
    const queryString = this.buildQueryString(sortedParams);

    const expectedSign = crypto
      .createHmac('sha1', this.merchantKey)
      .update(queryString)
      .digest('hex');

    return expectedSign.toLowerCase() === receivedSign.toLowerCase();
  }

  private buildQueryString(params: Record<string, any>): string {
    return Object.entries(params)
      .map(([key, value]) => {
        const stringValue =
          typeof value === 'object' ? JSON.stringify(value) : String(value);
        return `${encodeURIComponent(key)}=${encodeURIComponent(stringValue)}`;
      })
      .join('&');
  }

  private sortParams(params: Record<string, any>): Record<string, any> {
    return Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {});
  }
}
