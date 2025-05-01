import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
@Injectable()
export class WebhookGuard implements CanActivate {
  private readonly secret = process.env.ALPHAPO_SECRET_KEY;

  constructor(private readonly redisService: RedisService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const signatureHeader = request.headers['x-processing-signature'];
    const rawBody = JSON.stringify(request.body);
    const expectedSignature = crypto
      .createHmac('sha512', this.secret)
      .update(rawBody)
      .digest('hex');

    if (signatureHeader !== expectedSignature) {
      throw new UnauthorizedException('Invalid AlphaPo signature');
    }

    const { status, foreign_id } = request.body;
    if (!foreign_id || status !== 'confirmed') {
      throw new BadRequestException('Invalid invoice status or foreign_id');
    }

    const invoice = await this.redisService.getInvoice(foreign_id);
    if (!invoice) {
      throw new BadRequestException('Unknown or expired invoice');
    }

    return true;
  }
}
