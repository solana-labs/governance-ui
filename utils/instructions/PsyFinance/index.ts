import { BN, Program, Provider, web3 } from '@project-serum/anchor'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import {
  AccountMeta,
  PublicKey,
  SystemProgram,
  SYSVAR_CLOCK_PUBKEY,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js'
import { PsyAmerican } from './PsyAmericanIdl'
import { OptionMarket, OptionMarketWithKey } from './types'

export { PsyAmericanIdl } from './PsyAmericanIdl'

export const PSY_AMERICAN_PROGRAM_ID = new PublicKey(
  'R2y9ip6mxmWUj4pt54jP2hz2dgvMozy9VTSwMWE7evs'
)
const FEE_OWNER_KEY = new PublicKey(
  '6c33US7ErPmLXZog9SyChQUYUrrJY51k4GmzdhrbhNnD'
)

/* Most utility functions are copy/pasta from `@mithraic-labs/psy-american` package  */

export const getOptionByKey = async (
  program: Program<PsyAmerican>,
  key: PublicKey
): Promise<OptionMarketWithKey | null> => {
  try {
    const optionAccount = ((await program.account.optionMarket.fetch(
      key
    )) as unknown) as OptionMarket

    return {
      ...optionAccount,
      key,
    }
  } catch (err) {
    return null
  }
}

/**
 * Get the deterministic address for an Option based on its properties.
 * @returns
 */
export const deriveOptionKeyFromParams = async ({
  expirationUnixTimestamp,
  programId,
  quoteAmountPerContract,
  quoteMint,
  underlyingAmountPerContract,
  underlyingMint,
}: {
  /** The OptionMarket expiration timestamp in seconds */
  expirationUnixTimestamp: BN
  /** The Psy American program ID */
  programId: PublicKey
  /** The quote asset amount per option contract  */
  quoteAmountPerContract: BN
  /** The quote asset mint address  */
  quoteMint: PublicKey
  /** The underlying asset amount per option contract */
  underlyingAmountPerContract: BN
  /** The underlying asset mint address */
  underlyingMint: PublicKey
}): Promise<[PublicKey, number]> => {
  return PublicKey.findProgramAddress(
    [
      underlyingMint.toBuffer(),
      quoteMint.toBuffer(),
      underlyingAmountPerContract.toArrayLike(Buffer, 'le', 8),
      quoteAmountPerContract.toArrayLike(Buffer, 'le', 8),
      expirationUnixTimestamp.toArrayLike(Buffer, 'le', 8),
    ],
    programId
  )
}

/**
 * Note this is legacy and no fees are on V2 instructions
 * @deprecated
 */
const feeAmountPerContract = (assetQuantity: BN) => {
  return assetQuantity.div(new BN(10_000 / 5))
}

/**
 * Initialize a new Option
 *
 * @param program - The Psy American program
 * @param params
 * @returns
 */
// Should probably dedupe the code between these functions
export const initializeOptionInstruction = async (
  program: Program<PsyAmerican>,
  {
    expirationUnixTimestamp,
    quoteAmountPerContract,
    quoteMint,
    underlyingAmountPerContract,
    underlyingMint,
  }: {
    /** The option market expiration timestamp in seconds */
    expirationUnixTimestamp: BN
    /** The quote amount per contract for the OptionMarket
     * Strike price is derived from underlyingAmountPerContract & quoteAmountPerContract */
    quoteAmountPerContract: BN
    /** The quote asset mint */
    quoteMint: PublicKey
    /** The underlying amount per contract for the OptionMarket. *
     * Strike price is derived from underlyingAmountPerContract & quoteAmountPerContract */
    underlyingAmountPerContract: BN
    /** The underlying mint address */
    underlyingMint: PublicKey
  }
): Promise<{
  optionMarketKey: PublicKey
  optionMintKey: PublicKey
  quoteAssetPoolKey: PublicKey
  tx: TransactionInstruction
  underlyingAssetPoolKey: PublicKey
  writerMintKey: PublicKey
}> => {
  const textEncoder = new TextEncoder()

  // generate Program Derived Address for the new option
  const [optionMarketKey, bumpSeed] = await deriveOptionKeyFromParams({
    programId: program.programId,
    underlyingMint,
    quoteMint,
    underlyingAmountPerContract,
    quoteAmountPerContract,
    expirationUnixTimestamp,
  })

  // generate Program Derived Address for the Option Token
  const [optionMintKey] = await web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('optionToken')],
    program.programId
  )
  // generate Program Derived Address for the Writer Token
  const [writerMintKey] = await web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('writerToken')],
    program.programId
  )

  // generate Program Derived Address for the vault that will hold the quote asset
  const [quoteAssetPoolKey] = await web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('quoteAssetPool')],
    program.programId
  )

  // generate Program Derived Address for the vault that will hold the underlying asset
  const [underlyingAssetPoolKey] = await web3.PublicKey.findProgramAddress(
    [optionMarketKey.toBuffer(), textEncoder.encode('underlyingAssetPool')],
    program.programId
  )

  // Determine whether the mint/exercise fee accounts need to be initialized.
  // Add the instructions and necessary accounts if the accounts need to
  // be created.
  const remainingAccounts: AccountMeta[] = []
  const instructions: TransactionInstruction[] = []
  const mintFeePerContract = feeAmountPerContract(underlyingAmountPerContract)
  if (mintFeePerContract.gtn(0)) {
    const mintFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      underlyingMint,
      FEE_OWNER_KEY
    )
    remainingAccounts.push({
      pubkey: mintFeeKey,
      isWritable: true,
      isSigner: false,
    })
    const ix = await getOrAddAssociatedTokenAccountTx(
      mintFeeKey,
      underlyingMint,
      program.provider,
      FEE_OWNER_KEY
    )
    if (ix) {
      instructions.push(ix)
    }
  }

  const exerciseFeePerContract = feeAmountPerContract(quoteAmountPerContract)
  if (exerciseFeePerContract.gtn(0)) {
    const exerciseFeeKey = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      quoteMint,
      FEE_OWNER_KEY
    )
    remainingAccounts.push({
      pubkey: exerciseFeeKey,
      isWritable: false,
      isSigner: false,
    })
    const ix = await getOrAddAssociatedTokenAccountTx(
      exerciseFeeKey,
      quoteMint,
      program.provider,
      FEE_OWNER_KEY
    )
    if (ix) {
      instructions.push(ix)
    }
  }

  const tx = await program.instruction.initializeMarket(
    underlyingAmountPerContract,
    quoteAmountPerContract,
    expirationUnixTimestamp,
    bumpSeed,
    {
      accounts: {
        // @ts-ignore
        authority: program.provider.wallet.publicKey,
        feeOwner: FEE_OWNER_KEY,
        optionMarket: optionMarketKey,
        optionMint: optionMintKey,
        quoteAssetMint: quoteMint,
        quoteAssetPool: quoteAssetPoolKey,
        underlyingAssetMint: underlyingMint,
        underlyingAssetPool: underlyingAssetPoolKey,
        writerTokenMint: writerMintKey,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        clock: SYSVAR_CLOCK_PUBKEY,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      instructions: instructions.length ? instructions : undefined,
      remainingAccounts,
    }
  )

  return {
    optionMarketKey,
    optionMintKey,
    quoteAssetPoolKey,
    tx,
    underlyingAssetPoolKey,
    writerMintKey,
  }
}

/* TODO refactor to gov ui utility function */
const getOrAddAssociatedTokenAccountTx = async (
  associatedAddress: PublicKey,
  mintKey: PublicKey,
  provider: Provider,
  owner: PublicKey = FEE_OWNER_KEY
): Promise<TransactionInstruction | null> => {
  const accountInfo = await provider.connection.getAccountInfo(
    associatedAddress
  )
  if (accountInfo) {
    // accountInfo exists, so the associated token account has already
    // been initialized
    return null
  }

  return Token.createAssociatedTokenAccountInstruction(
    ASSOCIATED_TOKEN_PROGRAM_ID,
    TOKEN_PROGRAM_ID,
    mintKey,
    associatedAddress,
    owner,
    // @ts-ignore
    provider.wallet.publicKey
  )
}
