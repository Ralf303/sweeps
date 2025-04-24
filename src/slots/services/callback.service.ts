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

  private async isTransactionProcessed(
    transactionId: string,
  ): Promise<boolean> {
    const tx = await this.userService.findTransaction(transactionId);
    return !!tx && !tx.rolled_back;
  }

  async handleBalance(data: BalanceCallbackDto) {
    const user = await this.userService.getCurrentUser(data.player_id);
    return { balance: user.balance.toFixed(2) };
  }

  async handleBet(data: BetCallbackDto) {
    // Проверка дубликата
    if (await this.isTransactionProcessed(data.transaction_id)) {
      throw new HttpException(
        {
          error_code: 'DUPLICATE_TRANSACTION',
          error_description: 'Transaction already processed',
        },
        HttpStatus.OK,
      );
    }

    const user = await this.userService.getCurrentUser(data.player_id);
    const betAmount = Number(data.amount);

    // Проверка на нулевую/отрицательную ставку
    if (betAmount <= 0) {
      return {
        balance: user.balance.toFixed(2),
        transaction_id: data.transaction_id,
      };
    }

    // Проверка достаточности баланса
    if (user.balance < betAmount) {
      throw new HttpException(
        {
          error_code: 'INSUFFICIENT_FUNDS',
          error_description: 'Not enough balance',
        },
        HttpStatus.OK,
      );
    }

    // Обновляем баланс и сохраняем транзакцию
    const newBalance = user.balance - betAmount;
    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'bet',
      amount: betAmount,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
    });

    // Обновляем dailyLose (если нужно)
    if ('dailyLose' in user) {
      await this.userService.updateDailyLose(
        data.player_id,
        user.dailyLose + betAmount,
      );
    }

    return {
      balance: newBalance.toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleWin(data: WinCallbackDto) {
    // Проверка дубликата
    if (await this.isTransactionProcessed(data.transaction_id)) {
      throw new HttpException(
        {
          error_code: 'DUPLICATE_TRANSACTION',
          error_description: 'Transaction already processed',
        },
        HttpStatus.OK,
      );
    }

    const user = await this.userService.getCurrentUser(data.player_id);
    const winAmount = Number(data.amount);

    // Проверка на нулевой/отрицательный выигрыш
    if (winAmount <= 0) {
      return {
        balance: user.balance.toFixed(2),
        transaction_id: data.transaction_id,
      };
    }

    // Обновляем баланс и сохраняем транзакцию
    const newBalance = user.balance + winAmount;
    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'win',
      amount: winAmount,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
    });

    // Обновляем dailyLose (если нужно)
    if ('dailyLose' in user) {
      const newDailyLose = Math.max(user.dailyLose - winAmount, 0);
      await this.userService.updateDailyLose(data.player_id, newDailyLose);
    }

    return {
      balance: newBalance.toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleRefund(data: RefundCallbackDto) {
    // Проверка дубликата
    if (await this.isTransactionProcessed(data.transaction_id)) {
      throw new HttpException(
        {
          error_code: 'DUPLICATE_TRANSACTION',
          error_description: 'Transaction already processed',
        },
        HttpStatus.OK,
      );
    }

    // Проверяем, что refund делается для существующей ставки (bet)
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

    const user = await this.userService.getCurrentUser(data.player_id);
    const refundAmount = Number(data.amount);

    // Возвращаем деньги и сохраняем транзакцию
    const newBalance = user.balance + refundAmount;
    await this.userService.updateBalance(data.player_id, newBalance);
    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'refund',
      amount: refundAmount,
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
    const user = await this.userService.getCurrentUser(data.player_id);
    let currentBalance = user.balance;

    // Находим все транзакции для отката (в рамках round_id)
    const transactions = await this.userService.getTransactionsForRollback(
      data.player_id,
      data.round_id,
    );

    // Откатываем каждую транзакцию
    for (const tx of transactions) {
      if (tx.action === 'bet') {
        currentBalance += tx.amount; // Возвращаем ставку
      } else if (tx.action === 'win') {
        currentBalance -= tx.amount; // Отменяем выигрыш
      }
      await this.userService.markTransactionAsRolledBack(tx.transaction_id);
    }

    // Сохраняем новый баланс и транзакцию rollback
    await this.userService.updateBalance(data.player_id, currentBalance);
    await this.userService.saveTransaction({
      player_id: data.player_id,
      transaction_id: data.transaction_id,
      action: 'rollback',
      amount: 0,
      round_id: data.round_id,
      game_uuid: data.game_uuid,
    });

    return {
      balance: currentBalance.toFixed(2),
      transaction_id: data.transaction_id,
    };
  }
}
