import {
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'
import { SignerWalletAdapter, WalletAdapter } from '@solana/wallet-adapter-base'
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import { BN } from '@project-serum/anchor'
import { Marinade, MarinadeConfig } from '@marinade.finance/marinade-ts-sdk'
import {
  getMintNaturalAmountFromDecimal,
  parseMintNaturalAmountFromDecimal,
} from '@tools/sdk/units'
import { ConnectionContext } from 'utils/connection'
import { getATA } from './ataTools'
import { isFormValid } from './formValidation'
import { getTokenAccountsByMint } from './tokens'
import { UiInstruction } from './uiTypes/proposalCreationTypes'
import { AssetAccount } from '@utils/uiTypes/assets'

export const validateInstruction = async ({
  schema,
  form,
  setFormErrors,
}): Promise<boolean> => {
  const { isValid, validationErrors } = await isFormValid(schema, form)
  setFormErrors(validationErrors)
  return isValid
}

export async function getGenericTransferInstruction({
  schema,
  form,
  programId,
  connection,
  wallet,
  setFormErrors,
  requiredStateInfo,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  requiredStateInfo: {
    /// The mint that is being transfered
    mint: PublicKey
    /// The TokenAccount address that will be sending the tokens
    tokenSource: PublicKey
    /// The number of decimals for this token's mint
    mintDecimals: number
    /// The governance that controls this account
    governance: ProgramAccount<Governance>
    /// The key that has to sign for the token transfer
    owner: PublicKey
  }
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (isValid && programId) {
    const sourceAccount = requiredStateInfo.tokenSource
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = requiredStateInfo.mint
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      requiredStateInfo.mintDecimals
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
      sourceAccount,
      receiverAddress,
      requiredStateInfo.owner,
      [],
      new u64(mintAmount.toString())
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: requiredStateInfo.governance,
    prerequisiteInstructions: prerequisiteInstructions,
  }
  return obj
}

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
  schema,
  form,
  programId,
  connection,
  wallet,
  currentAccount,
  setFormErrors,
  nftMint,
}: {
  schema: any
  form: any
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  currentAccount: AssetAccount | null
  setFormErrors: any
  nftMint: string
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    programId &&
    form.governedTokenAccount?.extensions.mint?.account
  ) {
    const tokenAccountsWithNftMint = await getTokenAccountsByMint(
      connection.current,
      nftMint
    )
    const isSolAccSource = tokenAccountsWithNftMint.find(
      (x) =>
        x.account.owner.toBase58() ===
        form.governedTokenAccount.extensions.transferAddress.toBase58()
    )?.publicKey
    const isGovernanceSource = tokenAccountsWithNftMint.find(
      (x) =>
        x.account.owner.toBase58() ===
        form.governedTokenAccount.governance.pubkey.toBase58()
    )?.publicKey
    //we find ata from connected wallet that holds the nft
    const sourceAccount = isSolAccSource || isGovernanceSource
    if (!sourceAccount) {
      throw 'Nft ata not found for governance'
    }
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = new PublicKey(nftMint)
    const mintAmount = 1
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
      isSolAccSource
        ? form.governedTokenAccount.extensions.transferAddress
        : form.governedTokenAccount.governance.pubkey,
      [],
      mintAmount
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
    const mintPK = form.mintAccount.governance.account.governedAccount
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
      form.mintAccount.governance.account.governedAccount,
      receiverAddress,
      form.mintAccount.governance!.pubkey,
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

export const getTransferInstructionObj = async ({
  connection,
  governedTokenAccount,
  destinationAccount,
  amount,
  wallet,
}: {
  connection: ConnectionContext
  governedTokenAccount: AssetAccount
  destinationAccount: string
  amount: number | BN
  wallet: SignerWalletAdapter
}) => {
  const obj: {
    transferInstruction: TransactionInstruction | null
    ataInstruction: TransactionInstruction | null
  } = {
    transferInstruction: null,
    ataInstruction: null,
  }
  const sourceAccount = governedTokenAccount.extensions.transferAddress
  //this is the original owner
  const destinationAccountPk = new PublicKey(destinationAccount)
  const mintPK = governedTokenAccount!.extensions!.mint!.publicKey!
  const mintAmount =
    typeof amount === 'number'
      ? parseMintNaturalAmountFromDecimal(
          amount,
          governedTokenAccount.extensions.mint!.account.decimals
        )
      : amount

  //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
  const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
    connection: connection,
    receiverAddress: destinationAccountPk,
    mintPK,
    wallet: wallet!,
  })
  //we push this createATA instruction to transactions to create right before creating proposal
  //we don't want to create ata only when instruction is serialized
  if (needToCreateAta) {
    const ataInst = Token.createAssociatedTokenAccountInstruction(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mintPK, // mint
      receiverAddress, // ata
      destinationAccountPk, // owner of token account
      wallet!.publicKey! // fee payer
    )
    obj.ataInstruction = ataInst
  }
  const transferIx = Token.createTransferInstruction(
    TOKEN_PROGRAM_ID,
    sourceAccount!,
    receiverAddress,
    governedTokenAccount!.extensions!.token!.account.owner,
    [],
    new u64(mintAmount.toString())
  )
  obj.transferInstruction = transferIx
  return obj
}
