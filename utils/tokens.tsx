import {
  Keypair,
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
import {
  MintMaxVoteWeightSource,
  MintMaxVoteWeightSourceType,
} from '@solana/spl-governance'
import { chunks } from './helpers'
import { getAccountName, WSOL_MINT } from '@components/instructions/tools'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import tokenPriceService from './services/tokenPrice'
import { notify } from './notifications'
import { BN } from '@project-serum/anchor'
import { abbreviateAddress } from './formatting'
import BigNumber from 'bignumber.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import { I80F48 } from '@blockworks-foundation/mango-client'
import { NFTWithMeta } from './uiTypes/VotePlugin'
import { ConnectionContext } from './connection'
import {
  HOLAPLEX_GRAPQL_URL_DEVNET,
  HOLAPLEX_GRAPQL_URL_MAINNET,
} from '@tools/constants'

export type TokenAccount = AccountInfo
export type MintAccount = MintInfo

export type TokenProgramAccount<T> = {
  publicKey: PublicKey
  account: T
}

export async function getOwnedTokenAccounts(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenProgramAccount<TokenAccount>[]> {
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

export const getTokenAccountsByMint = async (
  connection: Connection,
  mint: string
): Promise<TokenProgramAccount<TokenAccount>[]> => {
  const results = await connection.getProgramAccounts(TOKEN_PROGRAM_ID, {
    filters: [
      {
        dataSize: 165,
      },
      {
        memcmp: {
          offset: 0,
          bytes: mint,
        },
      },
    ],
  })
  return results.map((r) => {
    const publicKey = r.pubkey
    const data = Buffer.from(r.account.data)
    const account = parseTokenAccountData(publicKey, data)
    return { publicKey, account }
  })
}

export async function tryGetMint(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenProgramAccount<MintAccount> | undefined> {
  try {
    const result = await connection.getAccountInfo(publicKey)
    const data = Buffer.from(result!.data)
    const account = parseMintAccountData(data)
    return {
      publicKey,
      account,
    }
  } catch (ex) {
    console.error(
      `Can't fetch mint ${publicKey?.toBase58()} @ ${connection.rpcEndpoint}`,
      ex
    )
    return undefined
  }
}

export const I80F48OptionalFromNumber = (val: number | undefined) => {
  return val || val === 0 ? I80F48.fromNumber(val) : undefined
}

export async function tryGetTokenAccount(
  connection: Connection,
  publicKey: PublicKey
): Promise<TokenProgramAccount<TokenAccount> | undefined> {
  try {
    const result = await connection.getAccountInfo(publicKey)

    if (!result?.owner.equals(TOKEN_PROGRAM_ID)) {
      return undefined
    }

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
): Promise<TokenProgramAccount<MintAccount> | undefined> {
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

export function parseMintAccountData(data: Buffer): MintAccount {
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
  existingTransferAuthority?: Keypair
): Keypair {
  const tokenProgram = TOKEN_PROGRAM_ID
  const transferAuthority = existingTransferAuthority || new Keypair()

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

//TODO refactor both methods (getMintAccountLabelInfo, getTokenAccountLabelInfo) make it more common
export function getTokenAccountLabelInfo(acc: AssetAccount | undefined) {
  let tokenAccount = ''
  let tokenName = ''
  let tokenAccountName = ''
  let amount = ''
  let imgUrl = ''

  if (acc?.extensions.token && acc.extensions.mint) {
    const info = tokenPriceService.getTokenInfo(
      acc.extensions!.mint!.publicKey.toBase58()
    )
    imgUrl = info?.logoURI ? info.logoURI : ''
    tokenAccount = acc.extensions.token.publicKey.toBase58()
    tokenName = info?.name
      ? info.name
      : abbreviateAddress(acc.extensions.mint.publicKey)
    tokenAccountName = getAccountName(acc.extensions.token.publicKey)
    amount = formatMintNaturalAmountAsDecimal(
      acc.extensions.mint!.account,
      acc.extensions.token?.account.amount
    )
  }
  return {
    tokenAccount,
    tokenName,
    tokenAccountName,
    amount,
    imgUrl,
  }
}

export function getSolAccountLabel(acc: AssetAccount | undefined) {
  let tokenAccount = ''
  let tokenName = ''
  let tokenAccountName = ''
  let amount = ''
  let imgUrl = ''

  if (acc?.extensions.mint) {
    const info = tokenPriceService.getTokenInfo(WSOL_MINT)
    imgUrl = info?.logoURI ? info.logoURI : ''
    tokenAccount = acc.extensions.transferAddress!.toBase58()
    tokenName = 'SOL'

    tokenAccountName = acc.extensions.transferAddress
      ? getAccountName(acc.extensions.transferAddress)
      : ''
    amount = formatMintNaturalAmountAsDecimal(
      acc.extensions.mint!.account,
      new BN(acc.extensions.solAccount!.lamports)
    )
  }
  return {
    tokenAccount,
    tokenName,
    tokenAccountName,
    amount,
    imgUrl,
  }
}

export function getMintAccountLabelInfo(acc: AssetAccount | undefined) {
  let account = ''
  let tokenName = ''
  let mintAccountName = ''
  let amount = ''
  let imgUrl = ''
  if (acc?.extensions.mint && acc.governance) {
    const info = tokenPriceService.getTokenInfo(
      acc.governance.account.governedAccount.toBase58()
    )
    imgUrl = info?.logoURI ? info.logoURI : ''
    account = acc.governance?.account.governedAccount.toBase58()
    tokenName = info?.name ? info.name : ''
    mintAccountName = getAccountName(acc.governance.account.governedAccount)
    amount = formatMintNaturalAmountAsDecimal(
      acc.extensions.mint.account,
      acc?.extensions.mint.account.supply
    )
  }
  return {
    account,
    tokenName,
    mintAccountName,
    amount,
    imgUrl,
  }
}

export type AccountInfoGen<T> = {
  executable: boolean
  owner: PublicKey
  lamports: number
  data: T
  rentEpoch?: number
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

const fetchNftsFromHolaplexIndexer = async (
  owner: PublicKey,
  cluster: string
) => {
  const result = await fetch(
    cluster === 'devnet'
      ? HOLAPLEX_GRAPQL_URL_DEVNET
      : HOLAPLEX_GRAPQL_URL_MAINNET,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
        query nfts($owners: [PublicKey!]) {
            nfts(
              owners: $owners,
               limit: 10000, offset: 0) {
              name
              mintAddress
              address
              image
              tokenAccountAddress
              updateAuthorityAddress
              collection {
                creators {
                  verified
                  address
                }
                mintAddress
              }

            }

        }
      `,
        variables: {
          owners: [owner.toBase58()],
        },
      }),
    }
  )

  const body = await result.json()
  return body.data
}

export const getNfts = async (
  ownerPk: PublicKey,
  connection: ConnectionContext
): Promise<NFTWithMeta[]> => {
  return await getNftsFromHolaplex(ownerPk, connection)
}

const getNftsFromHolaplex = async (
  ownerPk: PublicKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connection: ConnectionContext
): Promise<NFTWithMeta[]> => {
  try {
    const data = await fetchNftsFromHolaplexIndexer(ownerPk, connection.cluster)
    return data.nfts.map((nft) => {
      return {
        ...nft,
        getAssociatedTokenAccount: async () => {
          return nft.tokenAccountAddress
        },
      }
    })
  } catch (error) {
    notify({
      type: 'error',
      message: 'Unable to fetch nfts',
    })
  }
  return []
}

export const parseMintSupplyFraction = (fraction: string) => {
  if (!fraction) {
    return MintMaxVoteWeightSource.FULL_SUPPLY_FRACTION
  }

  const fractionValue = new BigNumber(fraction)
    .shiftedBy(MintMaxVoteWeightSource.SUPPLY_FRACTION_DECIMALS)
    .toNumber()

  return new MintMaxVoteWeightSource({
    type: MintMaxVoteWeightSourceType.SupplyFraction,
    value: new BN(fractionValue),
  })
}

export const SCALED_FACTOR_SHIFT = 9

export function getScaledFactor(amount: number) {
  return new BN(
    new BigNumber(amount.toString()).shiftedBy(SCALED_FACTOR_SHIFT).toString()
  )
}

export function getUnscaledFactor(amount: number) {
  return amount / + `1e${SCALED_FACTOR_SHIFT}`
}