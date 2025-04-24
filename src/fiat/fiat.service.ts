// import { Injectable } from '@nestjs/common';
// import {
//   ChangellyFiatClient,
//   ChangellyPaymentMethod,
// } from '@changelly/fiat-api-sdk-node';
// import { PrismaService } from '../prisma/prisma.service';
// import { randomUUID } from 'crypto';

// @Injectable()
// export class FiatService {
//   private readonly changellyClient: ChangellyFiatClient;

//   constructor(private readonly prisma: PrismaService) {
//     const privateKey = process.env.CHANGELLY_PRIVATE_KEY;
//     const publicKey = process.env.CHANGELLY_PUBLIC_KEY;

//     this.changellyClient = new ChangellyFiatClient({
//       privateKey,
//       publicKey,
//     });
//   }

//   async initiateTopUp(
//     userId: string,
//     amountFrom: number,
//     currencyFrom: string,
//     currencyTo: string,
//     walletAddress: string,
//     country: string,
//   ) {
//     const user = await this.prisma.user.findUnique({ where: { id: userId } });
//     if (!user) {
//       throw new Error('Пользователь не найден');
//     }

//     const offers = await this.changellyClient.getOffers({
//       currencyFrom,
//       currencyTo,
//       amountFrom: amountFrom.toString(),
//       country,
//     });

//     console.log('Available offers:', offers);
//     if (!offers || offers.length === 0) {
//       throw new Error('Нет доступных предложений');
//     }

//     const selectedOffer = offers[0];

//     const createOrderResponse = await this.changellyClient.createOrder({
//       externalUserId: userId,
//       providerCode: selectedOffer.providerCode,
//       currencyFrom,
//       currencyTo,
//       amountFrom: amountFrom.toString(),
//       country,
//       walletAddress,
//       paymentMethod: ChangellyPaymentMethod.Card,
//       externalOrderId: randomUUID(),
//     });

//     console.log('Create order response:', createOrderResponse);

//     const orderId = createOrderResponse.orderId;

//     await this.prisma.transaction.create({
//       data: {
//         userId,
//         changellyOrderId: orderId,
//         amountFrom,
//         currencyFrom,
//         currencyTo,
//         status: 'pending',
//       },
//     });

//     return { redirectUrl: createOrderResponse.redirectUrl };
//   }
// }
