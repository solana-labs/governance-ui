// Copied from Explorer code https://github.com/solana-labs/solana/blob/master/explorer/src/validators/accounts/token.ts

import { PublicKey } from '@solana/web3.js'
import { TokenProgramAccount, TokenAccount } from '@utils/tokens'
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

export function validateTokenAccountMint(
  tokenAccount: TokenProgramAccount<TokenAccount>,
  mint: PublicKey | undefined
) {
  if (mint && tokenAccount.account.mint.toBase58() !== mint.toBase58()) {
    throw new Error("Account mint doesn't match source account")
  }
}
