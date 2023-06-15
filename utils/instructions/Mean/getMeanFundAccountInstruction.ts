import { PaymentStreamingAccount } from '@mean-dao/payment-streaming'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  MeanFundAccount,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import createPaymentStreaming from './createPaymentStreaming'

function getGovernedAccountPk(acc: AssetAccount): PublicKey {
  return (acc.isSol
    ? acc.extensions.transferAddress
    : acc.extensions?.token?.account?.owner) as PublicKey
}

interface Args {
  connection: ConnectionContext
  form: MeanFundAccount
  setFormErrors: any // TODO
  schema: any // TODO
}
export default async function getMeanCreateAccountInstruction({
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
    governedTokenAccount.extensions.mint
  ) {
    const paymentStreaming = createPaymentStreaming(connection)
    const feePayer = getGovernedAccountPk(governedTokenAccount)
    const contributor = feePayer
    const mint = governedTokenAccount.extensions.mint.publicKey
    const psAccount = new PublicKey(formPaymentStreamingAccount.id)
    const amount = parseMintNaturalAmountFromDecimal(
      form.amount,
      governedTokenAccount.extensions.mint.account.decimals
    )
    const {
      transaction,
    } = await paymentStreaming.buildAddFundsToAccountTransaction(
      { psAccount, psAccountMint: mint, contributor, feePayer },
      amount
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
