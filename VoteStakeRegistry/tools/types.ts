import { LockupType } from 'VoteStakeRegistry/sdk/accounts'

export interface Period {
  defaultValue: number
  display: string
}
export interface LockupKind {
  value: LockupType
  info: string[]
  displayName: string
}
export interface VestingPeriod {
  value: number
  display: string
  info: string
}
export const MONTHLY = 'monthly'
export const CONSTANT = 'constant'
export const lockupTypes: LockupKind[] = [
  {
    value: 'cliff',
    displayName: 'Cliff',
    info: [
      'Tokens are locked for a fixed duration and are released in full at the end of it.',
      'Vote weight declines linearly until release.',
      'Example: You lock 10.000 tokens for two years. They are then unavailable for the next two years. After this time, you can withdraw them again.',
    ],
  },
  {
    value: CONSTANT,
    displayName: 'Constant',
    info: [
      'Tokens are locked indefinitely. At any time you can start the unlock process which lasts for the initially chosen lockup duration.',
      'Vote weight stays constant until you start the unlock process, then it declines linearly until release.',
      'Example: You lock 10.000 tokens with a lockup duration of one year. After two years you decide to start the unlocking process. Another year after that, you can withdraw the tokens.',
    ],
  },
  {
    value: MONTHLY,
    displayName: 'Vested',
    info: [
      'Tokens are locked for a fixed duration and released over time at a rate of (locked amount / number of periods) per vesting period.',
      'Vote weight declines linearly and with each vesting until release.',
      'Example: You lock 12.000 tokens for one year with monthly vesting. Every month 1.000 tokens unlock. After the year, all tokens have unlocked.',
    ],
  },
]

export const vestingPeriods: VestingPeriod[] = [
  {
    value: 30,
    display: 'Monthly',
    info: 'per month',
  },
]
