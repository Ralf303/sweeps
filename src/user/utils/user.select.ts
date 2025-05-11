export const USER_SELECT_FIELDS = {
  id: true,
  nickname: true,
  email: true,
  role: true,
  avatar: true,
  balance: true,
  referralsCount: true,
  referralLevel: true,
  referralCode: true,
  refPercentage: true,
  dailyLose: true,
  referralAllLose: true,
  isBanned: true,
  createdAt: true,
  updatedAt: true,
  referredById: true,
  referredBy: {
    select: {
      id: true,
      nickname: true,
    },
  },
};
