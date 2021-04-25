import * as bs58 from 'bs58'
import { Connection, ParsedAccountData, PublicKey } from '@solana/web3.js'
import { AccountLayout, AccountInfo, MintInfo, u64 } from '@solana/spl-token'

export type TokenAccount = AccountInfo
export type MintAccount = MintInfo
export type ProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)

export function parseTokenAccountData(
  data: Buffer
): { mint: PublicKey; owner: PublicKey; amount: u64 } {
  const { mint, owner, amount } = AccountLayout.decode(data)
  return {
    mint: new PublicKey(mint),
    owner: new PublicKey(owner),
    amount: u64.fromBuffer(amount),
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
        offset: AccountLayout.offsetOf('owner'),
        bytes: publicKey.toBase58(),
      },
    },
    {
      dataSize: AccountLayout.span,
    },
  ]
}

export async function getMint(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<MintAccount>> {
  const result = await connection.getParsedAccountInfo(publicKey)
  const account = (result.value.data as ParsedAccountData).parsed.info
  account.freezeAuthority =
    account.freezeAuthority && new PublicKey(account.freezeAuthority)
  account.mintAuthority =
    account.mintAuthority && new PublicKey(account.mintAuthority)
  return {
    publicKey,
    account,
  }
}
