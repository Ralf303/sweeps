import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class WebhookGuard implements CanActivate {
  private readonly secret = process.env.ALPHAPO_SECRET_KEY || 'your-secret';

  canActivate(context: ExecutionContext): boolean {
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
    if (status !== 'confirmed' || !foreign_id) {
      throw new BadRequestException('Invalid invoice status or foreign_id');
    }

    return true;
  }
}
