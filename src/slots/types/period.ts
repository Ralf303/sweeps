export type Period = 'daily' | 'weekly' | 'monthly' | 'global';

export enum PeriodMap {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  global = 'global',
}

export const fieldMap = {
  daily: 'dailyLosses',
  weekly: 'weeklyLosses',
  monthly: 'monthlyLosses',
  global: 'totalLosses',
} as const;
