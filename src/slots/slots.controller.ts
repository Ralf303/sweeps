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
import { InitDemoGameDto, InitGameDto } from './dto/init.demo.game.dto';
// import * as path from 'path';
// import * as fs from 'fs';
import { CallbackService } from './services/callback.service';
import { SignatureService } from './services/signature.service';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';

@ApiTags('Slotegrator Integration')
@Controller('slots')
export class SlotsController {
  constructor(
    private readonly slotegratorService: SlotegratorService,
    private readonly callbackService: CallbackService,
    private readonly signatureService: SignatureService,
  ) {}
  private readonly logger = new Logger(SlotsController.name);

  private validateSignature(headers: Record<string, string>, body: any) {
    const requiredHeaders = [
      'x-merchant-id',
      'x-timestamp',
      'x-nonce',
      'x-sign',
    ];
    const missingHeaders = requiredHeaders.filter((h) => !headers[h]);

    if (missingHeaders.length > 0) {
      throw new HttpException(
        {
          error_code: 'MISSING_HEADERS',
          error_description: `Missing headers: ${missingHeaders.join(', ')}`,
        },
        HttpStatus.OK,
      );
    }

    const isValid = this.signatureService.validateSignature(
      body,
      headers,
      headers['x-sign'],
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

  private routeRequest(action: string, data: any) {
    switch (action.toLowerCase()) {
      case 'balance':
        return this.callbackService.handleBalance(data);
      case 'bet':
        return this.callbackService.handleBet(data);
      case 'win':
        return this.callbackService.handleWin(data);
      case 'refund':
        return this.callbackService.handleRefund(data);
      case 'rollback':
        return this.callbackService.handleRollback(data);
      default:
        throw new HttpException(
          {
            error_code: 'INVALID_ACTION',
            error_description: `Unknown action: ${action}`,
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
      // 1. Валидация заголовков
      const requiredHeaders = [
        'x-merchant-id',
        'x-timestamp',
        'x-nonce',
        'x-sign',
      ];
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers[h.toLowerCase()] && !headers[h],
      );

      if (missingHeaders.length > 0) {
        throw new HttpException(
          {
            error_code: 'MISSING_HEADERS',
            error_description: `Missing headers: ${missingHeaders.join(', ')}`,
          },
          HttpStatus.OK,
        );
      }

      // 2. Проверка подписи
      const isValid = this.signatureService.validateSignature(
        body,
        headers,
        headers['x-sign'] || headers['X-Sign'],
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

      // // 3. Проверка таймстампа (±30 секунд)
      // const timestamp = parseInt(
      //   headers['x-timestamp'] || headers['X-Timestamp'],
      // );
      // const now = Math.floor(Date.now() / 1000);
      // if (Math.abs(now - timestamp) > 30) {
      //   throw new HttpException(
      //     {
      //       error_code: 'EXPIRED_REQUEST',
      //       error_description: 'Request timestamp expired',
      //     },
      //     HttpStatus.OK,
      //   );
      // }

      // 4. Обработка запроса
      return this.routeRequest(body.action, body);
    } catch (error) {
      this.logger.error('Webhook processing failed', {
        error: error.message,
        stack: error.stack,
        body,
        headers,
      });
      throw error;
    }
  }

  // private logRequest(body: any, headers: Record<string, string>) {
  //   const logEntry = {
  //     timestamp: new Date().toISOString(),
  //     headers: this.redactSensitiveHeaders(headers),
  //     body,
  //   };

  //   fs.writeFileSync(
  //     path.join('logs', `webhook-${Date.now()}.json`),
  //     JSON.stringify(logEntry, null, 2),
  //   );
  // }

  @Get('games')
  async getGames(@Query() query: any): Promise<any> {
    return this.slotegratorService.getGames(query);
  }

  @Post('init-demo')
  @ApiOperation({
    summary: 'Initialize demo game session',
    description: 'Creates demo session and returns game URL',
  })
  @ApiBody({
    type: InitDemoGameDto,
    examples: {
      desktopDemo: {
        value: {
          game_uuid: 'game_123',
          device: 'desktop',
          return_url: 'https://example.com/return',
          language: 'en',
        },
      },
      mobileDemo: {
        value: {
          game_uuid: 'game_456',
          device: 'mobile',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Game launch URL',
    schema: {
      example: {
        url: 'https://games.slotegrator.com/demo?token=demo_123',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
    schema: {
      example: {
        statusCode: 400,
        message: 'Validation failed',
        error: 'Bad Request',
      },
    },
  })
  async initDemoGame(@Body() body: InitDemoGameDto) {
    return this.slotegratorService.initDemoGame(body);
  }

  @Post('init')
  @ApiOperation({
    summary: 'Initialize real money game session',
    description: 'Creates real money session and returns game URL',
  })
  @ApiBody({
    type: InitGameDto,
    examples: {
      standardInit: {
        value: {
          game_uuid: 'game_789',
          player_id: 'player_123',
          player_name: 'JohnDoe',
          currency: 'USD',
          session_id: 'session_456',
          device: 'mobile',
          return_url: 'https://example.com/return',
          language: 'en',
        },
      },
      fullInit: {
        value: {
          game_uuid: 'game_789',
          player_id: 'player_123',
          player_name: 'JohnDoe',
          currency: 'USD',
          session_id: 'session_456',
          device: 'mobile',
          return_url: 'https://example.com/return',
          language: 'en',
        },
      },
    },
  })
  @ApiOkResponse({
    description: 'Game launch URL',
    schema: {
      example: {
        url: 'https://games.slotegrator.com/play?token=real_456',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invalid request data',
    schema: {
      example: {
        statusCode: 400,
        message: ['player_id should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  async initGame(@Body() body: InitGameDto) {
    return this.slotegratorService.initGame(body);
  }

  @Post('self-validate')
  @HttpCode(200)
  async getValidate() {
    return this.slotegratorService.getValidate();
  }
}
