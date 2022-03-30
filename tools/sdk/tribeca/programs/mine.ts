import type { AnchorTypes } from '@saberhq/anchor-contrib'

import type { QuarryMineIDL } from '../idls/quarry_mine'

export * from '../idls/quarry_mine'

export type MineTypes = AnchorTypes<
  QuarryMineIDL,
  {
    rewarder: RewarderData
    quarry: QuarryData
    miner: MinerData
  }
>

type Accounts = MineTypes['Accounts']
export type RewarderData = Accounts['Rewarder']
export type QuarryData = Accounts['Quarry']
export type MinerData = Accounts['Miner']

export type MineError = MineTypes['Error']
export type MineEvents = MineTypes['Events']
export type MineProgram = MineTypes['Program']

export type ClaimEvent = MineEvents['ClaimEvent']
export type StakeEvent = MineEvents['StakeEvent']
export type WithdrawEvent = MineEvents['WithdrawEvent']
export type QuarryRewardsUpdateEvent = MineEvents['QuarryRewardsUpdateEvent']
