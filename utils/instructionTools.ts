import { serializeInstructionToBase64 } from '@solana/spl-governance'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
  u64,
} from '@solana/spl-token'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import {
  Account,
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
import type { ConnectionContext } from 'utils/connection'
import { getATA } from './ataTools'
import { isFormValid } from './formValidation'
import {
  getTokenAccountsByMint,
  GovernedMintInfoAccount,
  GovernedTokenAccount,
} from './tokens'
import { UiInstruction } from './uiTypes/proposalCreationTypes'
import { ConnectedVoltSDK, FriktionSDK } from '@friktion-labs/friktion-sdk'
import { AnchorWallet } from '@friktion-labs/friktion-sdk/dist/cjs/src/miscUtils'
import { WSOL_MINT } from '@components/instructions/tools'
import Decimal from 'decimal.js'

export const validateInstruction = async ({
  schema,
  form,
  setFormErrors,
}): Promise<boolean> => {
  const { isValid, validationErrors } = await isFormValid(schema, form)
  setFormErrors(validationErrors)
  return isValid
}

export async function getFriktionDepositInstruction({
  schema,
  form,
  amount,
  connection,
  wallet,
  setFormErrors,
}: {
  schema: any
  form: any
  amount: number
  programId: PublicKey | undefined
  connection: ConnectionContext
  wallet: WalletAdapter | undefined
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount
  const voltVaultId = new PublicKey(form.voltVaultId as string)

  const signers: Keypair[] = []
  if (
    isValid &&
    amount &&
    governedTokenAccount?.token?.publicKey &&
    governedTokenAccount?.token &&
    governedTokenAccount?.mint?.account &&
    governedTokenAccount?.governance &&
    wallet
  ) {
    const sdk = new FriktionSDK({
      provider: {
        connection: connection.current,
        wallet: (wallet as unknown) as AnchorWallet,
      },
    })
    const cVoltSDK = new ConnectedVoltSDK(
      connection.current,
      wallet.publicKey as PublicKey,
      await sdk.loadVoltByKey(voltVaultId)
    )

    const voltVault = cVoltSDK.voltVault
    const vaultMint = cVoltSDK.voltVault.vaultMint

    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const { currentAddress: receiverAddress, needToCreateAta } = await getATA({
      connection: connection,
      receiverAddress: governedTokenAccount.governance.pubkey,
      mintPK: vaultMint,
      wallet,
    })
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      prerequisiteInstructions.push(
        Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          vaultMint, // mint
          receiverAddress, // ata
          governedTokenAccount.governance.pubkey, // owner of token account
          wallet.publicKey! // fee payer
        )
      )
    }

    let pendingDepositInfo
    try {
      pendingDepositInfo = await cVoltSDK.getPendingDepositForUser()
    } catch (err) {
      pendingDepositInfo = null
    }

    if (
      pendingDepositInfo &&
      pendingDepositInfo.roundNumber.lt(voltVault.roundNumber) &&
      pendingDepositInfo?.numUnderlyingDeposited?.gtn(0)
    ) {
      prerequisiteInstructions.push(
        await cVoltSDK.claimPending(receiverAddress)
      )
    }

    let depositTokenAccountKey: PublicKey | null

    if (governedTokenAccount.isSol) {
      const { currentAddress: receiverAddress, needToCreateAta } = await getATA(
        {
          connection: connection,
          receiverAddress: governedTokenAccount.governance.pubkey,
          mintPK: new PublicKey(WSOL_MINT),
          wallet,
        }
      )
      if (needToCreateAta) {
        prerequisiteInstructions.push(
          Token.createAssociatedTokenAccountInstruction(
            ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
            TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
            new PublicKey(WSOL_MINT), // mint
            receiverAddress, // ata
            governedTokenAccount.governance.pubkey, // owner of token account
            wallet.publicKey! // fee payer
          )
        )
      }
      depositTokenAccountKey = receiverAddress
    } else {
      depositTokenAccountKey = governedTokenAccount.transferAddress!
    }

    try {
      let decimals = 9

      if (!governedTokenAccount.isSol) {
        const underlyingAssetMintInfo = await new Token(
          connection.current,
          governedTokenAccount.mint.publicKey,
          TOKEN_PROGRAM_ID,
          (null as unknown) as Account
        ).getMintInfo()
        decimals = underlyingAssetMintInfo.decimals
      }

      const depositIx = governedTokenAccount.isSol
        ? await cVoltSDK.depositWithTransfer(
            new Decimal(amount),
            depositTokenAccountKey,
            receiverAddress,
            governedTokenAccount.transferAddress!,
            governedTokenAccount.governance.pubkey,
            decimals
          )
        : await cVoltSDK.deposit(
            new Decimal(amount),
            depositTokenAccountKey,
            receiverAddress,
            governedTokenAccount.governance.pubkey,
            decimals
          )

      const governedAccountIndex = depositIx.keys.findIndex(
        (k) =>
          k.pubkey.toString() ===
          governedTokenAccount.governance?.pubkey.toString()
      )
      depositIx.keys[governedAccountIndex].isSigner = true

      serializedInstruction = serializeInstructionToBase64(depositIx)
    } catch (e) {
      if (e instanceof Error) {
        throw new Error('Error: ' + e.message)
      }
      throw e
    }
  }
  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    prerequisiteInstructions: prerequisiteInstructions,
    signers,
    shouldSplitIntoSeparateTxs: true,
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
  currentAccount: GovernedTokenAccount | null
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount
  if (
    isValid &&
    programId &&
    governedTokenAccount?.token?.publicKey &&
    governedTokenAccount?.token &&
    governedTokenAccount?.mint?.account
  ) {
    const sourceAccount = governedTokenAccount.token?.account.address
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = form.governedTokenAccount.mint.publicKey
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.mint.account.decimals
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
      currentAccount!.token!.account.owner,
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
  currentAccount: GovernedTokenAccount | null
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  const governedTokenAccount = form.governedTokenAccount as GovernedTokenAccount
  if (
    isValid &&
    programId &&
    governedTokenAccount?.token?.publicKey &&
    governedTokenAccount?.token &&
    governedTokenAccount?.mint?.account
  ) {
    const sourceAccount = governedTokenAccount.transferAddress
    const destinationAccount = new PublicKey(form.destinationAccount)
    //We have configured mint that has same decimals settings as SOL
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      governedTokenAccount.mint.account.decimals
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
  currentAccount: GovernedTokenAccount | null
  setFormErrors: any
  nftMint: string
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  let serializedInstruction = ''
  const prerequisiteInstructions: TransactionInstruction[] = []
  if (
    isValid &&
    programId &&
    form.governedTokenAccount?.token?.publicKey &&
    form.governedTokenAccount?.token &&
    form.governedTokenAccount?.mint?.account
  ) {
    const tokenAccountsWithNftMint = await getTokenAccountsByMint(
      connection.current,
      nftMint
    )
    //we find ata from connected wallet that holds the nft
    const sourceAccount = tokenAccountsWithNftMint.find(
      (x) =>
        x.account.owner.toBase58() ===
        form.governedTokenAccount.governance.pubkey?.toBase58()
    )?.publicKey
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
      form.governedTokenAccount.governance!.pubkey,
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
  governedMintInfoAccount: GovernedMintInfoAccount | undefined
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
      form.mintAccount.mintInfo?.decimals
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
  setFormErrors,
}: {
  schema: any
  form: any
  connection: ConnectionContext
  setFormErrors: any
}): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })
  const prerequisiteInstructions: TransactionInstruction[] = []
  let serializedInstruction = ''

  if (
    isValid &&
    form.governedTokenAccount.transferAddress &&
    form.destinationAccount.governance.pubkey
  ) {
    const amount = getMintNaturalAmountFromDecimal(
      form.amount,
      form.governedTokenAccount.mint.account.decimals
    )
    const originAccount = form.governedTokenAccount.transferAddress
    const destinationAccount = form.destinationAccount.governance.pubkey

    const config = new MarinadeConfig({
      connection: connection.current,
      publicKey: originAccount,
    })
    const marinade = new Marinade(config)

    const { transaction } = await marinade.deposit(new BN(amount), {
      mintToOwnerAddress: destinationAccount,
    })

    if (transaction.instructions.length === 1) {
      serializedInstruction = serializeInstructionToBase64(
        transaction.instructions[0]
      )
    } else {
      throw Error('No mSOL Account can be found for the choosen account.')
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
