import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  Post,
  Query,
} from '@nestjs/common';
import { SlotegratorService } from './services/slotegrator.service';
import { InitDemoGameDto } from './dto/init.demo.game.dto';
import * as path from 'path';
import * as fs from 'fs';
import { CallbackService } from './services/callback.service';
import { SignatureService } from './services/signature.service';

@Controller('slots')
export class SlotsController {
  constructor(
    private readonly slotegratorService: SlotegratorService,
    private readonly callbackService: CallbackService,
    private readonly signatureService: SignatureService,
  ) {}
  private readonly logger = new Logger(SlotsController.name);

  private validateSignature(headers: Record<string, string>, body: any) {
    const merchantId = headers['x-merchant-id'];
    const timestamp = headers['x-timestamp'];
    const nonce = headers['x-nonce'];
    const sign = headers['x-sign'];

    const authHeaders = {
      'X-Merchant-Id': merchantId,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce,
    };

    const isValid = this.signatureService.validateSignature(
      body,
      authHeaders,
      sign,
    );

    if (!isValid) {
      throw new HttpException(
        {
          error_code: 'INVALID_SIGNATURE',
          error_description: 'Signature validation failed',
        },
        HttpStatus.OK,
      );
    }
  }

  @HttpCode(200)
  @Post('webhook')
  async handleWebhook(
    @Body() body: any,
    @Headers() headers: Record<string, string>,
  ) {
    try {
      const logsDir = path.join(process.cwd(), 'logs');
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir);
      }

      const now = new Date();
      const fileName = `webhook-${now.toISOString().replace(/[:.]/g, '-')}.txt`;
      const filePath = path.join(logsDir, fileName);

      fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

      this.logger.log(`Webhook saved to ${filePath}`);
      this.validateSignature(headers, body);

      switch (body.action) {
        case 'balance':
          this.logger.log('Balance action');
          return this.callbackService.handleBalance(body);
        case 'bet':
          this.logger.log('Bet action');
          return this.callbackService.handleBet(body);
        case 'win':
          this.logger.log('Win action');
          return this.callbackService.handleWin(body);
        case 'refund':
          this.logger.log('Refund action');
          return this.callbackService.handleRefund(body);
        case 'rollback':
          this.logger.log('Rollback action');
          return this.callbackService.handleRollback(body);
        default:
          throw new HttpException(
            {
              error_code: 'INVALID_ACTION',
              error_description: 'Unknown action type',
            },
            HttpStatus.OK,
          );
      }
    } catch (error) {
      this.logger.error('Error saving webhook', error);
      throw error;
    }
  }

  @Get('games')
  async getGames(@Query() query: any): Promise<any> {
    return this.slotegratorService.getGames(query);
  }

  @Post('init-demo')
  async initDemoGame(@Body() body: InitDemoGameDto) {
    return this.slotegratorService.initDemoGame(body);
  }

  @Post('init')
  async initGame(@Body() body: any) {
    return this.slotegratorService.initGame(body);
  }
}
