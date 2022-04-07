import type { AnchorTypes } from '@saberhq/anchor-contrib'

import type { Bonding } from '@soceanfi/bonding/dist/idl/idl'
import { IDL } from '@soceanfi/bonding/dist/idl/idl'

export type BondingTypes = AnchorTypes<
  Bonding,
  {
    bondPool: BondPoolData
    vesting: VestingData
  }
>

export const BondingJSON = IDL

type Accounts = BondingTypes['Accounts']

export type BondPoolData = Accounts['bondPool']
export type VestingData = Accounts['vesting']

export declare type ClaimOutcome = 'Partial' | 'Complete'

export type BondingProgram = BondingTypes['Program']
