// import {
//   Controller,
//   Post,
//   Body,
//   HttpCode,
//   Logger,
//   InternalServerErrorException,
// } from '@nestjs/common';
// import { FiatService } from './fiat.service';
// import { PrismaService } from '../prisma/prisma.service';
// import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
// import * as fs from 'fs';
// import * as path from 'path';
// import { CreateOrderDto } from './dto/create.order.dto';

// @ApiTags('Fiat')
// @Controller('fiat')
// export class FiatController {
//   constructor(
//     private readonly fiatService: FiatService,
//     private readonly prisma: PrismaService,
//   ) {}
//   private readonly logger = new Logger(FiatController.name);

//   @Post('createOrder')
//   @ApiOperation({
//     summary: 'Создать заказ на пополнение баланса криптовалютой',
//     description:
//       'Инициирует заказ на покупку криптовалюты за фиат через Changelly и возвращает URL для оплаты.',
//   })
//   @ApiBody({
//     type: CreateOrderDto,
//     description: 'Данные для создания заказа',
//     examples: {
//       example1: {
//         summary: 'Пример запроса',
//         value: {
//           userId: 'uuid-пользователя',
//           amountFrom: 100,
//           currencyFrom: 'USD',
//           currencyTo: 'USDT',
//           walletAddress: '0x123...abc',
//           country: 'US',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 201,
//     description: 'Заказ успешно создан',
//     schema: {
//       type: 'object',
//       properties: {
//         redirectUrl: {
//           type: 'string',
//           description: 'URL для перенаправления на страницу оплаты',
//         },
//       },
//       example: {
//         redirectUrl: 'https://provider.changelly.com/payment?orderId=123',
//       },
//     },
//   })
//   @ApiResponse({
//     status: 400,
//     description: 'Неверные данные в запросе или пользователь не найден',
//   })
//   @ApiResponse({
//     status: 500,
//     description:
//       'Внутренняя ошибка сервера или отсутствие предложений от Changelly',
//   })
//   async topUp(@Body() body: CreateOrderDto) {
//     const {
//       userId,
//       amountFrom,
//       currencyFrom,
//       currencyTo,
//       walletAddress,
//       country,
//     } = body;

//     return this.fiatService.initiateTopUp(
//       userId,
//       amountFrom,
//       currencyFrom,
//       currencyTo,
//       walletAddress,
//       country,
//     );
//   }

//   @HttpCode(200)
//   @Post('webhook')
//   async handleWebhook(@Body() body: any) {
//     try {
//       const logsDir = path.join(process.cwd(), 'logs');
//       if (!fs.existsSync(logsDir)) {
//         fs.mkdirSync(logsDir);
//       }

//       const now = new Date();
//       const fileName = `webhook-${now.toISOString().replace(/[:.]/g, '-')}.txt`;
//       const filePath = path.join(logsDir, fileName);

//       fs.writeFileSync(filePath, JSON.stringify(body, null, 2));

//       this.logger.log(`Webhook saved to ${filePath}`);
//       const { orderId, status, amountTo, externalUserId } = body;

//       if (status === 'completed') {
//         const transaction = await this.prisma.transaction.findFirst({
//           where: { changellyOrderId: orderId },
//         });

//         if (transaction && transaction.userId === externalUserId) {
//           await this.prisma.user.update({
//             where: { id: transaction.userId },
//             data: { balance: { increment: parseFloat(amountTo) } },
//           });

//           await this.prisma.transaction.update({
//             where: { id: transaction.id },
//             data: { status: 'completed', amountTo: parseFloat(amountTo) },
//           });

//           return { success: true, message: 'Баланс обновлен' };
//         }
//       }

//       return { success: false, message: 'Транзакция не обработана' };
//     } catch (error) {
//       this.logger.error('Error saving webhook', error);
//       throw new InternalServerErrorException('Error saving webhook');
//     }
//   }
// }
