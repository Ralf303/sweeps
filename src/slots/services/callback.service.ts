import { Decimal } from 'decimal.js';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {
  BalanceCallbackDto,
  BetCallbackDto,
  RefundCallbackDto,
  RollbackCallbackDto,
  WinCallbackDto,
} from '../dto/callback.dto';
import { UserService } from 'src/user/user.service';
import { RedisService } from 'src/redis/redis.service';
import { LiveGateway } from 'src/live/live.gateway';

@Injectable()
export class CallbackService {
  constructor(
    private userService: UserService,
    private readonly redisService: RedisService,
    private readonly liveBetsGateway: LiveGateway,
  ) {}

  private async validateRequest(data: { player_id: string }) {
    const user = await this.userService.getCurrentUser(data.player_id);
    if (!user) {
      throw new HttpException(
        `User not found with id ${data.player_id}`,
        HttpStatus.NOT_FOUND,
      );
    }
    return user;
  }

  private async isTransactionProcessed(
    transactionId: string,
  ): Promise<boolean> {
    const tx = await this.userService.findTransaction(transactionId);
    return !!tx && !tx.rolled_back;
  }

  async handleBalance(data: BalanceCallbackDto) {
    const user = await this.validateRequest(data);
    return { balance: new Decimal(user.balance).toFixed(2) };
  }

  async handleBet(data: BetCallbackDto) {
    const user = await this.validateRequest(data);

    if (!data.game_uuid || !data.round_id) {
      throw new HttpException(
        {
          error_code: 'MISSING_PARAMETERS',
          error_description: 'game_uuid and round_id are required',
        },
        HttpStatus.OK,
      );
    }

    if (await this.isTransactionProcessed(data.transaction_id)) {
      throw new HttpException(
        {
          error_code: 'DUPLICATE_TRANSACTION',
          error_description: 'Transaction already processed',
        },
        HttpStatus.OK,
      );
    }

    const betAmount = new Decimal(data.amount);
    if (betAmount.lessThanOrEqualTo(0)) {
      throw new HttpException(
        {
          error_code: 'INVALID_AMOUNT',
          error_description: 'Bet amount must be positive',
        },
        HttpStatus.OK,
      );
    }

    const currentBalance = new Decimal(user.balance);
    if (currentBalance.lessThan(betAmount)) {
      throw new HttpException(
        {
          error_code: 'INSUFFICIENT_FUNDS',
          error_description: 'Not enough balance',
        },
        HttpStatus.OK,
      );
    }

    const newBalance = currentBalance.minus(betAmount).toNumber();

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateDailyLose(
      data.player_id,
      new Decimal(user.dailyLose).plus(betAmount).toNumber(),
    );

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'bet',
      amount: betAmount.toNumber(),
      currency: data.currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
      session_id: data.session_id,
    });

    return {
      balance: new Decimal(newBalance).toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleWin(data: WinCallbackDto) {
    const user = await this.validateRequest(data);

    if (!data.game_uuid || !data.round_id) {
      throw new HttpException(
        {
          error_code: 'MISSING_PARAMETERS',
          error_description: 'game_uuid and round_id are required',
        },
        HttpStatus.OK,
      );
    }

    if (await this.isTransactionProcessed(data.transaction_id)) {
      throw new HttpException(
        {
          error_code: 'DUPLICATE_TRANSACTION',
          error_description: 'Transaction already processed',
        },
        HttpStatus.OK,
      );
    }

    const winAmount = new Decimal(data.amount);
    if (winAmount.lessThanOrEqualTo(0)) {
      throw new HttpException(
        {
          error_code: 'INVALID_AMOUNT',
          error_description: 'Win amount must be positive',
        },
        HttpStatus.OK,
      );
    }

    const newBalance = new Decimal(user.balance).plus(winAmount).toNumber();
    const newDailyLose = Decimal.max(
      0,
      new Decimal(user.dailyLose).minus(winAmount),
    ).toNumber();

    if (winAmount.greaterThan(0)) {
      try {
        const [gameMode, hasFlag] = await Promise.all([
          this.redisService.getGameMode(data.player_id),
          this.redisService.checkNotificationFlag(data.player_id),
        ]);

        if (gameMode && !hasFlag) {
          await this.redisService.setNotificationFlag(data.player_id);

          this.liveBetsGateway.sendLiveBetNotification({
            gameName: gameMode,
            playerName: user.nickname,
            amount: winAmount.toNumber(),
          });
        }
      } catch (error) {
        console.log(error);
      }
    }

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateDailyLose(data.player_id, newDailyLose);

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'win',
      amount: winAmount.toNumber(),
      currency: data.currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
    });

    return {
      balance: new Decimal(newBalance).toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleRefund(data: RefundCallbackDto) {
    const user = await this.validateRequest(data);

    if (await this.isTransactionProcessed(data.transaction_id)) {
      throw new HttpException(
        {
          error_code: 'DUPLICATE_TRANSACTION',
          error_description: 'Transaction already processed',
        },
        HttpStatus.OK,
      );
    }

    const originalBet = await this.userService.findTransaction(
      data.bet_transaction_id,
    );

    if (!originalBet || originalBet.action !== 'bet') {
      throw new HttpException(
        {
          error_code: 'INVALID_REFUND',
          error_description: 'Refund only allowed for bets',
        },
        HttpStatus.OK,
      );
    }

    if (originalBet.game_uuid !== data.game_uuid) {
      throw new HttpException(
        {
          error_code: 'GAME_MISMATCH',
          error_description: 'Refund game mismatch',
        },
        HttpStatus.OK,
      );
    }

    if (originalBet.rolled_back) {
      throw new HttpException(
        {
          error_code: 'ALREADY_ROLLED_BACK',
          error_description: 'Original bet already rolled back',
        },
        HttpStatus.OK,
      );
    }

    const maxRefundable = new Decimal(originalBet.amount).minus(
      originalBet.refunded_amount,
    );
    const refundAmount = Decimal.min(
      maxRefundable,
      new Decimal(data.amount),
    ).toNumber();

    if (refundAmount <= 0) {
      throw new HttpException(
        {
          error_code: 'INVALID_AMOUNT',
          error_description: 'Invalid refund amount',
        },
        HttpStatus.OK,
      );
    }

    const newBalance = new Decimal(user.balance).plus(refundAmount).toNumber();

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateRefundedAmount(
      data.bet_transaction_id,
      refundAmount,
    );

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'refund',
      amount: refundAmount,
      currency: originalBet.currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
      bet_transaction_id: data.bet_transaction_id,
    });

    return {
      balance: new Decimal(newBalance).toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleRollback(data: RollbackCallbackDto) {
    const user = await this.validateRequest(data);
    const transactions = await this.userService.getTransactionsForRollback(
      data.player_id,
      data.round_id,
    );

    if (transactions.length === 0) {
      throw new HttpException(
        {
          error_code: 'NO_TRANSACTIONS',
          error_description: 'Nothing to rollback',
        },
        HttpStatus.OK,
      );
    }

    const baseCurrency = transactions[0].currency;
    const baseGameUuid = transactions[0].game_uuid;
    let balanceChange = new Decimal(0);

    for (const tx of transactions) {
      if (tx.currency !== baseCurrency) {
        throw new HttpException(
          {
            error_code: 'MULTI_CURRENCY_ROLLBACK',
            error_description: 'Cannot rollback multiple currencies',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (tx.game_uuid !== baseGameUuid) {
        throw new HttpException(
          {
            error_code: 'MULTI_GAME_ROLLBACK',
            error_description: 'Cannot rollback multiple games',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      if (tx.rolled_back) {
        throw new HttpException(
          {
            error_code: 'ALREADY_ROLLED_BACK',
            error_description: `Transaction ${tx.transaction_id} already rolled back`,
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      balanceChange =
        tx.action === 'bet'
          ? balanceChange.plus(tx.amount)
          : balanceChange.minus(tx.amount);
    }

    const newBalance = new Decimal(user.balance).plus(balanceChange).toNumber();

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.markTransactionsAsRolledBack(
      transactions.map((tx) => tx.transaction_id),
    );

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'rollback',
      amount: balanceChange.toNumber(),
      currency: baseCurrency,
      round_id: data.round_id,
      game_uuid: baseGameUuid,
    });

    return {
      balance: new Decimal(newBalance).toFixed(2),
      transaction_id: data.transaction_id,
    };
  }
}
