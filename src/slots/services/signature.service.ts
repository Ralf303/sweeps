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
    requestBody: Record<string, any>,
    headers: Record<string, string>,
    receivedSign: string,
  ): boolean {
    const mergedParams = { ...requestBody, ...headers };
    const sortedParams = this.sortParams(mergedParams);
    const hashString = new URLSearchParams(sortedParams).toString();

    const expectedSign = crypto
      .createHmac('sha1', this.merchantKey)
      .update(hashString)
      .digest('hex');

    return expectedSign === receivedSign;
  }

  private sortParams(params: Record<string, any>): Record<string, any> {
    const sorted: Record<string, any> = {};
    Object.keys(params)
      .sort()
      .forEach((key) => {
        sorted[key] = params[key];
      });
    return sorted;
  }
}
