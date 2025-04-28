import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import {
  BalanceCallbackDto,
  BetCallbackDto,
  WinCallbackDto,
  RefundCallbackDto,
  RollbackCallbackDto,
} from '../dto/callback.dto';
import { UserService } from 'src/user/user.service';

@Injectable()
export class CallbackService {
  constructor(private userService: UserService) {}

  private async validateRequest(data: { player_id: string }) {
    try {
      return await this.userService.getCurrentUser(data.player_id);
    } catch (e: any) {
      throw new HttpException(
        `User not found with id ${e}`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private async isTransactionProcessed(
    transactionId: string,
  ): Promise<boolean> {
    const tx = await this.userService.findTransaction(transactionId);
    return !!tx && !tx.rolled_back;
  }

  async handleBalance(data: BalanceCallbackDto) {
    const user = await this.validateRequest(data);
    return { balance: user.balance.toFixed(2) };
  }

  async handleBet(data: BetCallbackDto) {
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

    const betAmount = Number(data.amount);
    if (betAmount <= 0) {
      throw new HttpException(
        {
          error_code: 'INVALID_AMOUNT',
          error_description: 'Bet amount must be positive',
        },
        HttpStatus.OK,
      );
    }

    if (user.balance < betAmount) {
      throw new HttpException(
        {
          error_code: 'INSUFFICIENT_FUNDS',
          error_description: 'Not enough balance',
        },
        HttpStatus.OK,
      );
    }

    const newBalance = Number((user.balance - betAmount).toFixed(2));

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateDailyLose(
      data.player_id,
      user.dailyLose + betAmount,
    );

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'bet',
      amount: betAmount,
      currency: data.currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
      session_id: data.session_id,
    });

    return {
      balance: newBalance.toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleWin(data: WinCallbackDto) {
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

    const winAmount = Number(data.amount);
    if (winAmount <= 0) {
      throw new HttpException(
        {
          error_code: 'INVALID_AMOUNT',
          error_description: 'Win amount must be positive',
        },
        HttpStatus.OK,
      );
    }

    const newBalance = Number((user.balance + winAmount).toFixed(2));
    const newDailyLose = Math.max(0, user.dailyLose - winAmount);

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateDailyLose(data.player_id, newDailyLose);

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'win',
      amount: winAmount,
      currency: data.currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
    });

    return {
      balance: newBalance.toFixed(2),
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

    const refundAmount = Math.min(Number(data.amount), originalBet.amount);
    if (refundAmount <= 0) {
      throw new HttpException(
        {
          error_code: 'INVALID_AMOUNT',
          error_description: 'Invalid refund amount',
        },
        HttpStatus.OK,
      );
    }

    const newBalance = Number((user.balance + refundAmount).toFixed(2));
    const newDailyLose = Math.max(0, user.dailyLose - refundAmount);

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateDailyLose(data.player_id, newDailyLose);

    await this.userService.markTransactionAsRefunded(data.bet_transaction_id);

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'refund',
      amount: refundAmount,
      currency: data.currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
      bet_transaction_id: data.bet_transaction_id,
    });

    return {
      balance: newBalance.toFixed(2),
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

    let balanceChange = 0;
    const currency = transactions[0].currency;

    for (const tx of transactions) {
      if (tx.currency !== currency) {
        throw new HttpException(
          {
            error_code: 'MULTI_CURRENCY_ROLLBACK',
            error_description: 'Cannot rollback multiple currencies',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      balanceChange += tx.action === 'bet' ? tx.amount : -tx.amount;
    }

    const newBalance = Number((user.balance + balanceChange).toFixed(2));
    const newDailyLose = Math.max(0, user.dailyLose - balanceChange);

    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.updateDailyLose(data.player_id, newDailyLose);

    for (const tx of transactions) {
      await this.userService.markTransactionAsRolledBack(tx.transaction_id);
    }

    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'rollback',
      amount: balanceChange,
      currency: currency,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
    });

    return {
      balance: newBalance.toFixed(2),
      transaction_id: data.transaction_id,
    };
  }
}
