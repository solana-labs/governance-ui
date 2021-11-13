import {
  Account,
  Connection,
  PublicKey,
  TransactionInstruction,
  AccountInfo as GenericAccountInfo,
} from '@solana/web3.js'
import {
  AccountInfo,
  AccountLayout,
  MintInfo,
  MintLayout,
  Token,
  u64,
} from '@solana/spl-token'
import { ParsedAccount } from '@models/core/accounts'
import { Governance } from '@models/accounts'
import { chunks } from './helpers'

export type TokenAccount = AccountInfo
export type MintAccount = MintInfo
export type GovernedTokenAccount = {
  token: ProgramAccount<AccountInfo> | undefined
  mint: ProgramAccount<MintInfo> | undefined
  governance: ParsedAccount<Governance> | undefined
}
export type ProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<TokenAccount>[]> {
  const results = await connection.getTokenAccountsByOwner(publicKey, {
    programId: TOKEN_PROGRAM_ID,
  })
  return results.value.map((r) => {
    const publicKey = r.pubkey
    const data = Buffer.from(r.account.data)
    const account = parseTokenAccountData(publicKey, data)
    return { publicKey, account }
  })
}

export async function tryGetMint(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<MintAccount> | undefined> {
  try {
    const result = await connection.getAccountInfo(publicKey)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = Buffer.from(result!.data)
    const account = parseMintAccountData(data)
    return {
      publicKey,
      account,
    }
  } catch (ex) {
    console.error(`Can't fetch mint ${publicKey?.toBase58()}`, ex)
  }
}

export async function tryGetTokenAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<TokenAccount> | undefined> {
  try {
    const result = await connection.getAccountInfo(publicKey)
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = Buffer.from(result!.data)
    const account = parseTokenAccountData(publicKey, data)
    return {
      publicKey,
      account,
    }
  } catch (ex) {
    console.error(`Can't fetch token account ${publicKey?.toBase58()}`, ex)
  }
}

export async function tryGetTokenMint(
  connection: Connection,
  publicKey: PublicKey
): Promise<ProgramAccount<MintAccount> | undefined> {
  const tokenAccount = await tryGetTokenAccount(connection, publicKey)
  return tokenAccount && tryGetMint(connection, tokenAccount.account.mint)
}

// copied from @solana/spl-token
export const TOKEN_PROGRAM_ID = new PublicKey(
  'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
)
export const BPF_UPGRADE_LOADER_ID = new PublicKey(
  'BPFLoaderUpgradeab1e11111111111111111111111'
)

export function parseTokenAccountData(
  account: PublicKey,
  data: Buffer
): TokenAccount {
  const accountInfo = AccountLayout.decode(data)
  accountInfo.address = account
  accountInfo.mint = new PublicKey(accountInfo.mint)
  accountInfo.owner = new PublicKey(accountInfo.owner)
  accountInfo.amount = u64.fromBuffer(accountInfo.amount)

  if (accountInfo.delegateOption === 0) {
    accountInfo.delegate = null
    accountInfo.delegatedAmount = new u64(0)
  } else {
    accountInfo.delegate = new PublicKey(accountInfo.delegate)
    accountInfo.delegatedAmount = u64.fromBuffer(accountInfo.delegatedAmount)
  }

  accountInfo.isInitialized = accountInfo.state !== 0
  accountInfo.isFrozen = accountInfo.state === 2

  if (accountInfo.isNativeOption === 1) {
    accountInfo.rentExemptReserve = u64.fromBuffer(accountInfo.isNative)
    accountInfo.isNative = true
  } else {
    accountInfo.rentExemptReserve = null
    accountInfo.isNative = false
  }

  if (accountInfo.closeAuthorityOption === 0) {
    accountInfo.closeAuthority = null
  } else {
    accountInfo.closeAuthority = new PublicKey(accountInfo.closeAuthority)
  }

  return accountInfo
}

export function parseMintAccountData(data: Buffer) {
  const mintInfo = MintLayout.decode(data)

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority)
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply)
  mintInfo.isInitialized = mintInfo.isInitialized != 0

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority)
  }
  return mintInfo
}

export function approveTokenTransfer(
  instructions: TransactionInstruction[],
  cleanupInstructions: TransactionInstruction[],
  account: PublicKey,
  owner: PublicKey,
  amount: number | u64,
  autoRevoke = true,

  // if delegate is not passed ephemeral transfer authority is used
  delegate?: PublicKey,
  existingTransferAuthority?: Account
): Account {
  const tokenProgram = TOKEN_PROGRAM_ID
  const transferAuthority = existingTransferAuthority || new Account()

  // Coerce amount to u64 in case it's deserialized as BN which differs by buffer conversion functions only
  // Without the coercion createApproveInstruction would fail because it won't be able to serialize it
  if (typeof amount !== 'number') {
    amount = new u64(amount.toArray())
  }

  instructions.push(
    Token.createApproveInstruction(
      tokenProgram,
      account,
      delegate ?? transferAuthority.publicKey,
      owner,
      [],
      amount
    )
  )

  if (autoRevoke) {
    cleanupInstructions.push(
      Token.createRevokeInstruction(tokenProgram, account, owner, [])
    )
  }

  return transferAuthority
}

export const getMultipleAccounts = async (
  connection: any,
  keys: string[],
  commitment = 'recent'
) => {
  const result = await Promise.all(
    chunks(keys, 99).map((chunk) =>
      getMultipleAccountsCore(connection, chunk, commitment)
    )
  )

  const array = result
    .map(
      (a) =>
        a.array.map((acc) => {
          if (!acc) {
            return undefined
          }

          const { data, ...rest } = acc
          const obj = {
            ...rest,
            data: Buffer.from(data[0], 'base64'),
          } as GenericAccountInfo<Buffer>
          return obj
        }) as GenericAccountInfo<Buffer>[]
    )
    .flat()
  return { keys, array }
}

const getMultipleAccountsCore = async (
  connection: any,
  keys: string[],
  commitment: string
) => {
  const args = connection._buildArgs([keys], commitment, 'base64')

  const unsafeRes = await connection._rpcRequest('getMultipleAccounts', args)
  if (unsafeRes.error) {
    throw new Error(
      'failed to get info about account ' + unsafeRes.error.message
    )
  }

  if (unsafeRes.result.value) {
    const array = unsafeRes.result.value as GenericAccountInfo<string[]>[]
    return { keys, array }
  }

  // TODO: fix
  throw new Error()
}
