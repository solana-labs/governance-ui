import { Connection, PublicKey } from '@solana/web3.js'
import * as bs58 from 'bs58'
import {
  AccountLayout as TokenLayout,
  AccountInfo as TokenAccount,
} from '@solana/spl-token'

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

export type ProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

export function parseTokenAccountData(
  data: Buffer
): { mint: PublicKey; owner: PublicKey; amount: number } {
  const { mint, owner, amount } = TokenLayout.decode(data)
  return {
    mint: new PublicKey(mint),
    owner: new PublicKey(owner),
    amount,
  }
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<TokenAccount>[]> {
  const filters = getOwnedAccountsFilters(publicKey)
  // @ts-ignore
  const resp = await connection._rpcRequest('getProgramAccounts', [
    TOKEN_PROGRAM_ID.toBase58(),
    {
      commitment: connection.commitment,
      filters,
    },
  ])
  if (resp.error) {
    throw new Error(
      'failed to get token accounts owned by ' +
        publicKey.toBase58() +
        ': ' +
        resp.error.message
    )
  }
  return resp.result.map(({ pubkey, account: { data } }) => {
    data = bs58.decode(data)
    return {
      publicKey: new PublicKey(pubkey),
      account: parseTokenAccountData(data),
    }
  })
}

export function getOwnedAccountsFilters(publicKey: PublicKey) {
  return [
    {
      memcmp: {
        offset: TokenLayout.offsetOf('owner'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: TokenLayout.span,
    },
  ]
}
