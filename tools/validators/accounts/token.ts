// Copied from Explorer code https://github.com/solana-labs/solana/blob/master/explorer/src/validators/accounts/token.ts

import {
  Infer,
  number,
  optional,
  enums,
  boolean,
  string,
  type,
} from 'superstruct'
import { PublicKeyFromString } from '../pubkey'

export type TokenAccountState = Infer<typeof AccountState>
const AccountState = enums(['initialized', 'uninitialized', 'frozen'])

const TokenAmount = type({
  decimals: number(),
  uiAmountString: string(),
  amount: string(),
})

export type TokenAccountInfo = Infer<typeof TokenAccountInfo>
export const TokenAccountInfo = type({
  mint: PublicKeyFromString,
  owner: PublicKeyFromString,
  tokenAmount: TokenAmount,
  delegate: optional(PublicKeyFromString),
  state: AccountState,
  isNative: boolean(),
  rentExemptReserve: optional(TokenAmount),
  delegatedAmount: optional(TokenAmount),
  closeAuthority: optional(PublicKeyFromString),
})
