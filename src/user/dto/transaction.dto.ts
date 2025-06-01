export interface TransactionDto {
  player_id: string;
  transaction_id: string;
  action: string;
  amount: number;
  currency?: string;
  round_id?: string;
  game_uuid?: string;
  session_id?: string;
  bet_transaction_id?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  multiplier?: number | null;
  profit?: number;
  gameName?: string;
  bet?: number;
  imageUrl?: string;
}
