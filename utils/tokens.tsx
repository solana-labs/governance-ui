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
  ASSOCIATED_TOKEN_PROGRAM_ID,
  MintInfo,
  MintLayout,
  Token,
  u64,
} from '@solana/spl-token'
import { MintMaxVoteWeightSource } from '@solana/spl-governance'
import { chunks } from './helpers'
import { getAccountName, WSOL_MINT } from '@components/instructions/tools'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import tokenService from './services/token'
import { notify } from './notifications'
import { BN } from '@project-serum/anchor'
import { abbreviateAddress } from './formatting'
import BigNumber from 'bignumber.js'
import { AssetAccount } from '@utils/uiTypes/assets'
import { I80F48 } from '@blockworks-foundation/mango-client'
import { NFTWithMeta } from './uiTypes/VotePlugin'
import { getParsedNftAccountsByOwner } from '@nfteyez/sol-rayz'
import axios from 'axios'
import { deprecated } from '@metaplex-foundation/mpl-token-metadata'
import { ConnectionContext } from './connection'

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
    console.error(`Can't fetch mint ${publicKey?.toBase58()}`, ex)
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
    const info = tokenService.getTokenInfo(
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
    const info = tokenService.getTokenInfo(WSOL_MINT)
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
    const info = tokenService.getTokenInfo(
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

const fetchNftsFromHolaplexIndexer = async (owner: PublicKey) => {
  const result = await fetch('https://graph.holaplex.com/v1', {
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
  })

  const body = await result.json()
  return body.data
}

export const getNfts = async (
  ownerPk: PublicKey,
  connection: ConnectionContext
): Promise<NFTWithMeta[]> => {
  if (connection.cluster === 'devnet') {
    return await getDevnetNfts(ownerPk, connection.current)
  } else {
    return await getMainnetNfts(ownerPk, connection.current)
  }
}

const getDevnetNfts = async (
  ownerPk: PublicKey,
  connection: Connection
): Promise<NFTWithMeta[]> => {
  const [nfts, tokenAccounts] = await Promise.all([
    getParsedNftAccountsByOwner({
      publicAddress: ownerPk.toBase58(),
      connection: connection,
    }),
    getOwnedTokenAccounts(connection, ownerPk),
  ])
  const data = Object.keys(nfts).map((key) => nfts[key])
  const arr: NFTWithMeta[] = []
  const vals = await Promise.all(data.map((x) => axios.get(x.data.uri)))
  const metadataAccounts = await Promise.all(
    data.map((x) => deprecated.Metadata.getPDA(x.mint))
  )
  for (let i = 0; i < data.length; i++) {
    try {
      const nft = data[i]
      const val = vals[i].data
      const tokenAccount = tokenAccounts.find((x) => {
        return (
          x.account.mint.toBase58() === data[i].mint &&
          x.account.amount.cmpn(0) === 1
        )
      })
      const metadataAccount = metadataAccounts[i]
      const metadata = await deprecated.Metadata.load(
        connection,
        metadataAccount
      )
      if (tokenAccount) {
        arr.push({
          image: val.image,
          name: val.name,
          description: val.description,
          properties: {
            category: val.properties?.category,
            files: val.properties?.files,
          },
          collection: {
            mintAddress: metadata?.data?.collection?.key || '',
            creators: nft.data.creators,
            verified: metadata?.data?.collection?.verified,
          },
          mintAddress: nft.mint,
          address: metadata.pubkey.toBase58(),
          tokenAccountAddress: tokenAccount.publicKey.toBase58(),
          getAssociatedTokenAccount: async () => {
            const ata = await Token.getAssociatedTokenAddress(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              new PublicKey(nft.mint), // mint
              ownerPk, // owner
              true
            )

            return ata.toBase58()
          },
        })
      }
    } catch (e) {
      console.log(e)
    }
  }
  return arr
}

const getMainnetNfts = async (
  ownerPk: PublicKey,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  connection: Connection
): Promise<NFTWithMeta[]> => {
  try {
    const data = await fetchNftsFromHolaplexIndexer(ownerPk)
    return data.nfts.map((nft) => {
      return {
        ...nft,
        getAssociatedTokenAccount: async () => {
          //   const accounts = await getOwnedTokenAccounts(connection, ownerPk)

          //   for (const account of accounts) {
          //     if (account.account.mint.toBase58() === nft.mintAddress) {
          //       return account.publicKey.toBase58()
          //     }
          //   }

          //   throw new Error('Could not find associated token account')
          const ata = await Token.getAssociatedTokenAddress(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            new PublicKey(nft.mintAddress), // mint
            ownerPk, // owner
            true
          )

          return ata.toBase58()
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
    value: new BN(fractionValue),
  })
}

export const SCALED_FACTOR_SHIFT = 9

export function getScaledFactor(amount: number) {
  return new BN(
    new BigNumber(amount.toString()).shiftedBy(SCALED_FACTOR_SHIFT).toString()
  )
}
