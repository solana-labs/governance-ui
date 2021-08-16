// Copied from Explorer code https://github.com/solana-labs/solana/blob/master/explorer/src/validators/accounts/token.ts

import { ParsedAccountData, AccountInfo, PublicKey } from '@solana/web3.js'
import {
  Infer,
  number,
  optional,
  enums,
  boolean,
  string,
  type,
  create,
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

export function validateTokenAccount(
  info: AccountInfo<Buffer | ParsedAccountData>,
  mint: PublicKey | undefined
) {
  if (!('parsed' in info.data && info.data.program === 'spl-token')) {
    throw new Error('Invalid spl token account')
  }

  let tokenAccount: TokenAccountInfo

  try {
    tokenAccount = create(info.data.parsed.info, TokenAccountInfo)
  } catch {
    throw new Error('Invalid spl token account')
  }

  if (mint && tokenAccount.mint.toBase58() !== mint.toBase58()) {
    throw new Error("Account mint doesn't match source account")
  }
}
