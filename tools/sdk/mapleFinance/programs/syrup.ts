import type { AnchorTypes } from '@saberhq/anchor-contrib';

import type { USyrupIDL } from '../idls/syrup';
export * from '../idls/syrup';

export type SyrupTypes = AnchorTypes<
  USyrupIDL,
  {
    globals: GlobalsData;
    lender: LenderData;
    loan: LoanData;
    pool: PoolData;
    withdrawalRequest: WithdrawalRequestData;
  }
>;

type Accounts = SyrupTypes['Accounts'];

export type GlobalsData = Accounts['Globals'];
export type LenderData = Accounts['Lender'];
export type LoanData = Accounts['Loan'];
export type PoolData = Accounts['Pool'];
export type WithdrawalRequestData = Accounts['WithdrawalRequest'];

export type SyrupProgram = SyrupTypes['Program'];
