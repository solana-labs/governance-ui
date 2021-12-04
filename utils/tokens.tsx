import {
  Account,
  Connection,
  PublicKey,
  TransactionInstruction,
  Commitment,
} from '@solana/web3.js'
import {
  AccountInfo,
  AccountLayout,
  MintInfo,
  MintLayout,
  Token,
  u64,
} from '@solana/spl-token'
import { ParsedAccount, ParsedAccountBase } from '@models/core/accounts'
import { Governance } from '@models/accounts'
import { chunks } from './helpers'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { getAccountName } from '@components/instructions/tools'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'

export type TokenAccount = AccountInfo
export type MintAccount = MintInfo
export type GovernedTokenAccount = {
  token: ProgramAccount<AccountInfo> | undefined
  mint: ProgramAccount<MintInfo> | undefined
  governance: ParsedAccount<Governance> | undefined
}
export type GovernedMintInfoAccount = {
  mintInfo: MintInfo
  governance: ParsedAccount<Governance> | undefined
}
export type GovernedProgramAccount = {
  governance: ParsedAccount<Governance> | undefined
}
export type GovernedMultiTypeAccount = {
  token?: ProgramAccount<AccountInfo> | undefined
  mint?: ProgramAccount<MintInfo> | undefined
  governance: ParsedAccount<Governance>
  mintInfo?: MintInfo | undefined
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

    if (!result?.owner.equals(TOKEN_PROGRAM_ID)) {
      return undefined
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const data = Buffer.from(result!.data)
    const account = parseTokenAccountData(publicKey, data)
    return {
      publicKey,
      account,
    }
  } catch (ex) {
    // This is Try method and is expected to fail and hence logging is uneccesery
    // console.error(`Can't fetch token account ${publicKey?.toBase58()}`, ex)
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

export async function getMultipleAccountInfoChunked(
  connection: Connection,
  keys: PublicKey[],
  commitment: Commitment | undefined = 'recent'
) {
  return (
    await Promise.all(
      chunks(keys, 99).map((chunk) =>
        connection.getMultipleAccountsInfo(chunk, commitment)
      )
    )
  ).flat()
}

export function getTokenAccountLabelInfo(
  acc: GovernedMultiTypeAccount | undefined
) {
  let tokenAccount = ''
  let tokenName = ''
  let tokenAccountName = ''
  let amount = ''

  if (acc?.token && acc.mint) {
    tokenAccount = acc.token.publicKey.toBase58()
    tokenName = getMintMetadata(acc.token.account.mint)?.name
    tokenAccountName = getAccountName(acc.token.publicKey)
    amount = formatMintNaturalAmountAsDecimal(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc.mint!.account,
      acc.token?.account.amount
    )
  }
  return {
    tokenAccount,
    tokenName,
    tokenAccountName,
    amount,
  }
}

export function getMintAccountLabelInfo(
  acc: GovernedMultiTypeAccount | undefined
) {
  let account = ''
  let tokenName = ''
  let mintAccountName = ''
  let amount = ''

  if (acc?.mintInfo && acc.governance) {
    account = acc.governance?.info.governedAccount.toBase58()
    tokenName = getMintMetadata(acc.governance?.info.governedAccount)?.name
    mintAccountName = getAccountName(acc.governance.info.governedAccount)
    amount = formatMintNaturalAmountAsDecimal(
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      acc.mintInfo,
      acc?.mintInfo.supply
    )
  }
  return {
    account,
    tokenName,
    mintAccountName,
    amount,
  }
}

export type AccountInfoGen<T> = {
  executable: boolean
  owner: PublicKey
  lamports: number
  data: T
  rentEpoch?: number
}

export const MintParser = (pubKey: PublicKey, info: AccountInfoGen<Buffer>) => {
  const buffer = Buffer.from(info.data)

  const data = deserializeMint(buffer)

  const details = {
    pubkey: pubKey,
    account: {
      ...info,
    },
    info: data,
  } as ParsedAccountBase

  return details
}

export const deserializeMint = (data: Buffer) => {
  if (data.length !== MintLayout.span) {
    throw new Error('Not a valid Mint')
  }

  const mintInfo = MintLayout.decode(data)

  if (mintInfo.mintAuthorityOption === 0) {
    mintInfo.mintAuthority = null
  } else {
    mintInfo.mintAuthority = new PublicKey(mintInfo.mintAuthority)
  }

  mintInfo.supply = u64.fromBuffer(mintInfo.supply)
  mintInfo.isInitialized = mintInfo.isInitialized !== 0

  if (mintInfo.freezeAuthorityOption === 0) {
    mintInfo.freezeAuthority = null
  } else {
    mintInfo.freezeAuthority = new PublicKey(mintInfo.freezeAuthority)
  }

  return mintInfo as MintInfo
}
