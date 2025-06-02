export type Period = 'daily' | 'weekly' | 'monthly' | 'global';

export enum PeriodMap {
  daily = 'daily',
  weekly = 'weekly',
  monthly = 'monthly',
  global = 'global',
}

export const fieldMap = {
  daily: 'dailyLose',
  weekly: 'weeklyLose',
  monthly: 'monthlyLose',
  global: 'globalLose',
} as const;
