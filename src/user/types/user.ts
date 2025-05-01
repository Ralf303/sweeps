export interface IUser {
  id: string;
  email: string;
  nickname: string;
  role: string;
  balance: number;
  referralsCount: number;
  referralCode: string;
  referralAllLose: number;
  isBanned: boolean;
}
