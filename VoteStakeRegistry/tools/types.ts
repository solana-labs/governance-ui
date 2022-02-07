import { LockupType } from 'VoteStakeRegistry/sdk/accounts'

export interface Period {
  value: number
  display: string
  multiplier: number
}
export interface LockupKind {
  value: LockupType
  info: string
  displayName: string
}
export interface VestingPeriod {
  value: number
  display: string
  info: string
}
export const MONTHLY = 'monthly'
export const lockupTypes: LockupKind[] = [
  {
    value: 'cliff',
    displayName: 'Cliff',
    info:
      'Tokens are locked for a set timeframe and are released in full at the end of the period. Vote weight increase declines linearly over the period.',
  },
  {
    value: 'constant',
    displayName: 'Constant',
    info:
      'Tokens are locked permanently for a timeframe. At any time a constant lockup can be converted to a cliff lockup with a timeframe greater than or equal to the constant lockup period. Vote weight increase stays constant until the lockup is converted to a cliff type lockup.',
  },
  {
    value: MONTHLY,
    displayName: 'Vested',
    info:
      'Tokens are locked for a given timeframe and released over time at a rate of (number of periods / locked amount) per release period and vest over time. Vote weight increase declines linearly over the period.',
  },
]

export const vestingPeriods: VestingPeriod[] = [
  {
    value: 30,
    display: 'Monthly',
    info: 'per month',
  },
]
