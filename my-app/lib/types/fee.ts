export enum FeeType {
  WITHOUT_AC = 'WITHOUT_AC',
  WITH_AC = 'WITH_AC',
  ONE_DAY = 'ONE_DAY',
}

export enum FeeStatus {
  PAID = 'Paid',
  UNPAID = 'Unpaid',
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  FREEZE = 'Freeze',
  DORMANT = 'Dormant',
}

export const FEE_AMOUNTS = {
  [FeeType.WITHOUT_AC]: 2500,
  [FeeType.WITH_AC]: 3000,
  [FeeType.ONE_DAY]: 150,
} as const;




