import { Injectable } from '@nestjs/common';
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

  async handleBalance(data: BalanceCallbackDto) {
    // Логика получения баланса

    const user = await this.userService.getCurrentUser(data.player_id);

    const balance = user.balance;

    return { balance: balance.toFixed(2) };
  }

  async handleBet(data: BetCallbackDto) {
    const user = await this.userService.getCurrentUser(data.player_id);
    const betAmount = Number(data.amount);

    // Обновляем баланс
    await this.userService.updateBalance(
      data.player_id,
      user.balance - betAmount,
    );

    if ('dailyLose' in user) {
      const newDailyLose = user.dailyLose + betAmount;
      await this.userService.updateDailyLose(data.player_id, newDailyLose);
    } else {
      throw new Error('User does not have a dailyLose property');
    }

    return {
      balance: (user.balance - betAmount).toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleWin(data: WinCallbackDto) {
    const user = await this.userService.getCurrentUser(data.player_id);
    const winAmount = Number(data.amount);

    if ('dailyLose' in user) {
      let newDailyLose = user.dailyLose - winAmount;
      if (newDailyLose < 0) newDailyLose = 0;

      await this.userService.updateDailyLose(data.player_id, newDailyLose);
    } else {
      throw new Error('User does not have a dailyLose property');
    }

    await this.userService.updateBalance(
      data.player_id,
      user.balance + winAmount,
    );

    return {
      balance: (user.balance + winAmount).toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleRefund(data: RefundCallbackDto) {
    // Логика обработки возврата

    const user = await this.userService.getCurrentUser(data.player_id);

    const { balance } = await this.userService.updateBalance(
      data.player_id,
      user.balance + Number(data.amount),
    );
    return {
      balance: balance.toFixed(2),
      transaction_id: data.transaction_id,
    };
  }

  async handleRollback(data: RollbackCallbackDto) {
    // Логика обработки отката

    const user = await this.userService.getCurrentUser(data.player_id);

    return {
      balance: user.balance.toFixed(2),
      transaction_id: data.transaction_id,
      rollback_transactions: data.rollback_transactions.map((transaction) => ({
        action: transaction.action,
        amount: transaction.amount,
        transaction_id: transaction.transaction_id,
      })),
    };
  }
}
