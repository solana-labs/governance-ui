import { Treasury } from '@mean-dao/msp'
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
import createMsp from './createMsp'

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
  const additionalSerializedInstructions = [] as string[]

  const formTreasury = form.treasury as Treasury | undefined

  if (
    governedTokenAccount &&
    formTreasury &&
    form.amount &&
    form.destination &&
    form.mintInfo
  ) {
    const msp = createMsp(connection)
    const payer = getGovernedAccountPk(governedTokenAccount)
    const treasury = new PublicKey(formTreasury.id) // treasury
    const amount = parseMintNaturalAmountFromDecimal(
      form.amount,
      form.mintInfo.decimals
    )
    const autoWSol = true
    const destination = new PublicKey(form.destination)
    const transaction = await msp.treasuryWithdraw(
      payer,
      destination,
      treasury,
      amount,
      autoWSol
    )

    transaction.instructions.map((i) =>
      additionalSerializedInstructions.push(serializeInstructionToBase64(i))
    )
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    additionalSerializedInstructions,
    shouldSplitIntoSeparateTxs: true,
  }

  return obj
}
