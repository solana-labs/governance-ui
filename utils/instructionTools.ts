import { serializeInstructionToBase64 } from '@models/serialisation'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { WalletAdapter } from '../@types/types'
import { ConnectionContext } from 'stores/useWalletStore'
import { findTrueReceiver } from './ataHelpers'
import { isFormValid } from './formValidation'
import { GovernedTokenAccount } from './tokens'
import { UiInstruction } from './uiTypes/proposalCreationTypes'
export const validateInstruction = async ({
  schema,
  form,
  setFormErrors,
}): Promise<boolean> => {
  const { isValid, validationErrors } = await isFormValid(schema, form)
  setFormErrors(validationErrors)
  return isValid
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
  const additionalTransactions: TransactionInstruction[] = []
  if (
    isValid &&
    programId &&
    form.governedTokenAccount?.token?.publicKey &&
    form.governedTokenAccount?.token &&
    form.governedTokenAccount?.mint?.account
  ) {
    const sourceAccount = form.governedTokenAccount.token?.account.address
    //this is the original owner
    const destinationAccount = new PublicKey(form.destinationAccount)
    const mintPK = form.governedTokenAccount.mint.publicKey
    const mintAmount = parseMintNaturalAmountFromDecimal(
      form.amount!,
      form.governedTokenAccount.mint.account.decimals
    )
    //we find true receiver address if its wallet and we need to create ATA the ata address will be the receiver
    const {
      currentAddress: receiverAddress,
      needToCreateAta,
    } = await findTrueReceiver(connection, destinationAccount, mintPK, wallet!)
    //we push this createATA instruction to transactions to create right before creating proposal
    //we don't want to create ata only when instruction is serialized
    if (needToCreateAta) {
      additionalTransactions.push(
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
      form.governedTokenAccount.governance!.pubkey,
      [],
      mintAmount
    )
    serializedInstruction = serializeInstructionToBase64(transferIx)
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governedAccount: currentAccount?.governance,
    additionalTransactions: additionalTransactions,
  }
  return obj
}
