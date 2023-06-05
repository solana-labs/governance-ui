import { PaymentStreamingAccount } from '@mean-dao/payment-streaming'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  MeanWithdrawFromAccount,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import createPaymentStreaming from './createPaymentStreaming'

interface Args {
  connection: ConnectionContext
  form: MeanWithdrawFromAccount
  setFormErrors: any // TODO
  schema: any // TODO
}

function getGovernedAccountPk(acc: AssetAccount): PublicKey {
  return (acc.isSol
    ? acc.extensions.transferAddress
    : acc.extensions?.token?.account?.owner) as PublicKey
}

export default async function getMeanWithdrawFromAccountInstruction({
  connection,
  form,
  setFormErrors,
  schema,
}: Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const governedTokenAccount = form.governedTokenAccount

  const formPaymentStreamingAccount = form.paymentStreamingAccount as
    | PaymentStreamingAccount
    | undefined

  if (
    isValid &&
    governedTokenAccount &&
    formPaymentStreamingAccount &&
    form.amount &&
    form.destination &&
    form.mintInfo
  ) {
    const paymentStreaming = createPaymentStreaming(connection)
    const feePayer = getGovernedAccountPk(governedTokenAccount)
    const psAccount = new PublicKey(formPaymentStreamingAccount.id) // treasury
    const amount = parseMintNaturalAmountFromDecimal(
      form.amount,
      form.mintInfo.decimals
    )
    const autoWSol = true
    const destination = new PublicKey(form.destination)
    const {
      transaction,
    } = await paymentStreaming.buildWithdrawFromAccountTransaction(
      { psAccount, feePayer, destination },
      amount,
      autoWSol
    )

    const additionalSerializedInstructions = transaction.instructions.map(
      serializeInstructionToBase64
    )

    const obj: UiInstruction = {
      serializedInstruction,
      isValid: true,
      governance: governedTokenAccount?.governance,
      additionalSerializedInstructions,
    }
    return obj
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: governedTokenAccount?.governance,
    additionalSerializedInstructions: [],
  }

  return obj
}
