import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  MeanCreateAccount,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import createPaymentStreaming from './createPaymentStreaming'

interface Args {
  connection: ConnectionContext
  form: MeanCreateAccount
  setFormErrors: any // TODO
  schema: any // TODO
}

function getGovernedAccountPk(acc: AssetAccount): PublicKey {
  return (acc.isSol
    ? acc.extensions.transferAddress
    : acc.extensions?.token?.account?.owner) as PublicKey
}

export default async function getMeanCreateAccountInstruction({
  connection,
  form,
  schema,
  setFormErrors,
}: Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const governedTokenAccount = form.governedTokenAccount

  if (
    isValid &&
    governedTokenAccount &&
    form.label &&
    form.amount &&
    governedTokenAccount.extensions.mint
  ) {
    const paymentStreaming = createPaymentStreaming(connection)
    const feePayer = getGovernedAccountPk(governedTokenAccount)
    const mint = governedTokenAccount.extensions.mint.publicKey
    const label = form.label
    const owner = governedTokenAccount.governance.pubkey
    const type = form.type

    console.log('111111', { owner, feePayer, mint }, label, type)
    const {
      transaction: transaction1,
      psAccount,
    } = await paymentStreaming.buildCreateAccountTransaction(
      { owner, feePayer, mint },
      label,
      type
    )

    const contributor = feePayer

    const amount = parseMintNaturalAmountFromDecimal(
      form.amount,
      governedTokenAccount.extensions.mint.account.decimals
    )
    console.log(
      '2222[',
      { psAccount, psAccountMint: mint, contributor, feePayer },
      amount
    )
    const {
      transaction: transaction2,
    } = await paymentStreaming.buildAddFundsToAccountTransaction(
      { psAccount, psAccountMint: mint, contributor, feePayer },
      amount
    )

    const additionalSerializedInstructions = [
      ...transaction1.instructions,
      ...transaction2.instructions,
    ].map(serializeInstructionToBase64)

    const obj: UiInstruction = {
      serializedInstruction,
      isValid: true,
      governance: governedTokenAccount?.governance,
      additionalSerializedInstructions,
      chunkSplitByDefault: true,
      chunkBy: 1,
    }
    return obj
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: governedTokenAccount?.governance,
    additionalSerializedInstructions: [],
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}
