import {
  getNativeTreasuryAddress,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk'
import {
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { ConnectionContext } from 'utils/connection'
import { getATA } from './ataTools'
import { isFormValid } from './formValidation'
import { UiInstruction } from './uiTypes/proposalCreationTypes'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  createCreateMetadataAccountV2Instruction,
  createUpdateMetadataAccountV2Instruction,
} from '@metaplex-foundation/mpl-token-metadata'
import { findMetadataPda } from '@metaplex-foundation/js'
import { lidoStake } from '@utils/lidoStake'
import { createIx_transferNft } from './metaplex'

export const validateInstruction = async ({
  schema,
  form,
  setFormErrors,
}): Promise<boolean> => {
  const { isValid, validationErrors } = await isFormValid(schema, form)
  setFormErrors(validationErrors)
  return isValid
}

/** @deprecated */
export async function getTransferInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  currentAccount,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  currentAccount: AssetAccount | null
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  if (
    isValid &&
    programId &&
    governedTokenAccount.extensions?.token?.publicKey &&
    governedTokenAccount.extensions?.token &&
    governedTokenAccount.extensions?.mint?.account
  ) {
    const sourceAccount = governedTokenAccount.extensions.transferAddress
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = form.governedTokenAccount.extensions.mint.publicKey
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.extensions.mint.account.decimals
    )

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }

    const transferIx = Token.createTransferInstruction(
      TOKEN_PROGRAM_ID,
      sourceAccount!,
      receiverAddress,
      currentAccount!.extensions!.token!.account.owner,
      [],
      new u64(mintAmount.toString())
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getSolTransferInstruction({
  schema,
  form,
  programId,
  currentAccount,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  currentAccount: AssetAccount | null
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as AssetAccount
  if (isValid && programId && governedTokenAccount?.extensions.mint?.account) {
    const sourceAccount = governedTokenAccount.extensions.transferAddress
    const destinationAccount = new PublicKey(form.destinationAccount)
    //We have configured mint that has same decimals settings as SOL
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.extensions.mint.account.decimals
    )

    const transferIx = SystemProgram.transfer({
      fromPubkey: sourceAccount!,
      toPubkey: destinationAccount,
      lamports: mintAmount,
    })
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: currentAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getTransferNftInstruction({
  toOwner,
  connection,
  ataCreationPayer,
  currentAccount,
  nftMint,
  assetAccount,
  programId,
}: {
  toOwner: PublicKey
  programId: PublicKey
  connection: ConnectionContext
  ataCreationPayer: PublicKey
  currentAccount: AssetAccount
  nftMint: string
  assetAccount: AssetAccount
}): Promise<UiInstruction> {
  const mint = new PublicKey(nftMint)
  //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver

  const destinationAtaPk = await Token.getAssociatedTokenAddress(
    ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
    TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
    mint, // mint
    toOwner, // owner
    true
  )
  const destinationAtaQueried = await connection.current.getAccountInfo(
    destinationAtaPk
  )
  // typically this should just be the same as the account that owns the NFT, but I'm just trying to be safe
  const nativeTreasury = await getNativeTreasuryAddress(
    programId,
    assetAccount.governance.pubkey
  )

  const transferIx = await createIx_transferNft(
    connection.current,
    assetAccount.pubkey,
    toOwner,
    mint,
    assetAccount.pubkey,
    nativeTreasury
  )

  return {
    serializedInstruction: serializeInstructionToBase64(transferIx),
    isValid: true,
    governance: currentAccount.governance,
    prerequisiteInstructions:
      destinationAtaQueried === null
        ? [
            Token.createAssociatedTokenAccountInstruction(
              ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
              TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
              mint, // mint
              destinationAtaPk, // ata
              toOwner, // owner of token account
              ataCreationPayer // fee payer
            ),
          ]
        : [],
  }
}

export async function getMintInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  governedMintInfoAccount,
  setFormErrors,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  governedMintInfoAccount: AssetAccount | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (isValid && programId && form.mintAccount?.governance?.pubkey) {
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)

    const mintPK = form.mintAccount.extensions.mint!.publicKey
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      form.mintAccount.extensions.mint.account?.decimals
    )

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection,
      receiverAddress: destinationAccount,
      mintPK,
      wallet: wallet!,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          mintPK, // mint
          receiverAddress, // ata
          destinationAccount, // owner of token account
          wallet!.publicKey! // fee payer
        )
      )
    }
    const transferIx = Token.createMintToInstruction(
      TOKEN_PROGRAM_ID,
      mintPK,
      receiverAddress,
      form.mintAccount.extensions.mint!.account.mintAuthority!,
      [],
      mintAmount
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedMintInfoAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getConvertToMsolInstruction({
  schema,
  form,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const prerequisiteInstructions: TransactionInstruction[] = []
  let serializedInstruction = ''

  if (isValid && form.governedTokenAccount.extensions.transferAddress) {
    const amount = getMintNaturalAmountFromDecimal(
      form.amount,
      form.governedTokenAccount.extensions.mint.account.decimals
    )
    const originAccount = form.governedTokenAccount.extensions.transferAddress
    let destinationAccountOwner: PublicKey
    const mSolMint = new PublicKey(
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'
    )

    const config = new MarinadeConfig({
      connection: connection.current,
      publicKey: originAccount,
    })
    const marinade = new Marinade(config)

    if (form.destinationAccount) {
      const destinationAccount = form.destinationAccount.pubkey

      const mSolToken = new Token(
        connection.current,
        mSolMint,
        TOKEN_PROGRAM_ID,
        (null as unknown) as Keypair
      )

      const destinationAccountInfo = await mSolToken.getAccountInfo(
        destinationAccount
      )
      destinationAccountOwner = destinationAccountInfo.owner
    } else {
      destinationAccountOwner = originAccount
      const {
        currentAddress: destinationAccount,
        needToCreateAta,
      } = await getATA({
        connection: connection,
        receiverAddress: originAccount,
        mintPK: mSolMint,
        wallet,
      })
      if (needToCreateAta && wallet?.publicKey) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            mSolMint,
            destinationAccount,
            originAccount,
            wallet.publicKey
          )
        )
      }
    }

    const { transaction } = await marinade.deposit(new BN(amount), {
      mintToOwnerAddress: destinationAccountOwner,
    })

    if (transaction.instructions.length === 1) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[0]
      )
    } else if (transaction.instructions.length === 2) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[1]
      )
    } else {
      throw Error(
        "Marinade's stake instructions could not be calculated correctly."
      )
    }
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: form.governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }

  return obj
}

export async function getConvertToStSolInstruction({
  schema,
  form,
  connection,
  wallet,
  setFormErrors,
  config,
}: {
  schema: any
  form: any
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
  config: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const prerequisiteInstructions: TransactionInstruction[] = []
  let serializedInstruction = ''

  if (isValid && form.governedTokenAccount.extensions.transferAddress) {
    const amount = getMintNaturalAmountFromDecimal(
      form.amount,
      form.governedTokenAccount.extensions.mint.account.decimals
    )
    let originAccount = form.governedTokenAccount.extensions.transferAddress
    let associatedStSolAccount: PublicKey

    if (form.destinationAccount) {
      associatedStSolAccount = form.destinationAccount.pubkey

      const stSolToken = new Token(
        connection.current,
        config.stSolMint,
        TOKEN_PROGRAM_ID,
        (null as unknown) as Keypair
      )

      const destinationAccountInfo = await stSolToken.getAccountInfo(
        associatedStSolAccount
      )
      originAccount = destinationAccountInfo.owner
    } else {
      const { currentAddress: stSolAccount, needToCreateAta } = await getATA({
        connection: connection,
        receiverAddress: originAccount,
        mintPK: config.stSolMint,
        wallet,
      })
      associatedStSolAccount = stSolAccount
      if (needToCreateAta && wallet?.publicKey) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID,
            TOKEN_PROGRAM_ID,
            config.stSolMint,
            associatedStSolAccount,
            originAccount,
            wallet.publicKey
          )
        )
      }
    }

    const transaction = await lidoStake({
      connection: connection.current,
      payer: originAccount,
      stSolAddress: associatedStSolAccount,
      amount,
      config,
    })

    if (transaction.instructions.length === 1) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[0]
      )
    } else if (transaction.instructions.length === 2) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[1]
      )
    } else {
      throw Error(
        `Lido's lidoStake instructions could not be calculated correctly.`
      )
    }
  }

  return {
    serializedInstruction,
    isValid,
    governance: form.governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
}

export async function getCreateTokenMetadataInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  governedMintInfoAccount,
  setFormErrors,
  mintAuthority,
  payerSolTreasury,
  shouldMakeSolTreasury,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  governedMintInfoAccount: AssetAccount | undefined
  setFormErrors: any
  mintAuthority: PublicKey | null | undefined
  payerSolTreasury: PublicKey | null | undefined
  shouldMakeSolTreasury: boolean
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []

  let payer = payerSolTreasury

  if (!payer && shouldMakeSolTreasury && governedMintInfoAccount) {
    payer = governedMintInfoAccount.governance.nativeTreasuryAddress
  }

  if (
    isValid &&
    programId &&
    form.mintAccount?.pubkey &&
    mintAuthority &&
    payer &&
    wallet
  ) {
    const metadataPDA = await findMetadataPda(form.mintAccount?.pubkey)

    const tokenMetadata = {
      name: form.name,
      symbol: form.symbol,
      uri: form.uri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    }

    const treasuryFee = await connection.current.getMinimumBalanceForRentExemption(
      0
    )
    // Todo: metadataSize is hardcoded at this moment but should be caliculated in the future.
    // On 8.July.2022, Metadata.getMinimumBalanceForRentExemption is returning wrong price.
    // const metadataFee = await Metadata.getMinimumBalanceForRentExemption(
    //   {
    //     key: Key.MetadataV1,
    //     updateAuthority: mintAuthority,
    //     mint: form.mintAccount?.pubkey,
    //     data: tokenMetadata,
    //     primarySaleHappened: true,
    //     isMutable: true,
    //     tokenStandard: TokenStandard.Fungible,
    //     uses: null,
    //     collection: null,
    //     editionNonce: 255,
    //   },
    //   connection.current
    // )
    const metadataFee = await connection.current.getMinimumBalanceForRentExemption(
      679
    )
    const treasuryInfo = await connection.current.getAccountInfo(payer)
    const solTreasury = treasuryInfo?.lamports ?? 0
    const amount = treasuryFee + metadataFee - solTreasury
    if (amount > 0) {
      const preTransferIx = SystemProgram.transfer({
        fromPubkey: wallet.publicKey!,
        toPubkey: payer,
        lamports: amount,
      })
      preTransferIx.keys[0].isWritable = true
      prerequisiteInstructions.push(preTransferIx)
    }

    const transferIx = createCreateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        mint: form.mintAccount?.pubkey,
        mintAuthority,
        payer,
        updateAuthority: mintAuthority,
      },
      {
        createMetadataAccountArgsV2: {
          data: tokenMetadata,
          isMutable: true,
        },
      }
    )
    transferIx.keys[3].isWritable = true
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedMintInfoAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export async function getUpdateTokenMetadataInstruction({
  schema,
  form,
  programId,
  governedMintInfoAccount,
  setFormErrors,
  mintAuthority,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  governedMintInfoAccount: AssetAccount | undefined
  setFormErrors: any
  mintAuthority: PublicKey | null | undefined
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (isValid && programId && form.mintAccount?.pubkey && mintAuthority) {
    const metadataPDA = await findMetadataPda(form.mintAccount?.pubkey)

    const tokenMetadata = {
      name: form.name,
      symbol: form.symbol,
      uri: form.uri,
      sellerFeeBasisPoints: 0,
      creators: null,
      collection: null,
      uses: null,
    }

    const transferIx = createUpdateMetadataAccountV2Instruction(
      {
        metadata: metadataPDA,
        updateAuthority: mintAuthority,
      },
      {
        updateMetadataAccountArgsV2: {
          data: tokenMetadata,
          updateAuthority: mintAuthority,
          primarySaleHappened: true,
          isMutable: true,
        },
      }
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedMintInfoAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

export const deduplicateObjsFilter = (value, index, self) =>
  index === self.findIndex((t) => JSON.stringify(t) === JSON.stringify(value))
