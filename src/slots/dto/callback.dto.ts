class TransactionBaseDto {
  action: 'balance' | 'bet' | 'win' | 'refund' | 'rollback';
  player_id: string;
  currency: string;
  session_id: string;
  game_uuid?: string;
  transaction_id?: string;
}

export class BalanceCallbackDto extends TransactionBaseDto {
  action: 'balance';
}

export class BetCallbackDto extends TransactionBaseDto {
  action: 'bet';
  amount: number;
  type: 'bet' | 'tip' | 'freespin';
  freespin_id?: string;
  quantity?: number;
  round_id?: string;
  finished?: boolean;
}

export class WinCallbackDto extends TransactionBaseDto {
  action: 'win';
  amount: number;
  bet_transaction_id: string;
  type:
    | 'win'
    | 'jackpot'
    | 'freespin'
    | 'bonus'
    | 'pragmatic_prize_drop'
    | 'pragmatic_tournament'
    | 'promo'
    | 'prize_drop'
    | 'tournament'
    | 'unaccounted_promo';
  freespin_id?: string;
  quantity?: number;
  round_id?: string;
  finished?: boolean;
}

export class RefundCallbackDto extends TransactionBaseDto {
  action: 'refund';
  amount: number;
  bet_transaction_id: string;
  type?: 'bet' | 'tip' | 'freespin';
  freespin_id?: string;
  quantity?: number;
  round_id?: string;
  finished?: boolean;
}

export class RollbackCallbackDto extends TransactionBaseDto {
  action: 'rollback';
  rollback_transactions: Array<{
    action: 'bet' | 'win' | 'refund';
    amount: number;
    transaction_id: string;
    type?: string;
  }>;
  provider_round_id: string;
  round_id: string;
}
