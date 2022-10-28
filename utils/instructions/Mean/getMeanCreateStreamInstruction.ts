import { TreasuryType } from '@mean-dao/msp'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { validateInstruction } from '@utils/instructionTools'
import { ConnectionContext } from '@utils/connection'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  MeanCreateAccount,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import createMsp from './createMsp'

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
}: //setFormErrors
Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const governedTokenAccount = form.governedTokenAccount
  const additionalSerializedInstructions = [] as string[]

  const obj: UiInstruction = {
    serializedInstruction,
    isValid,
    governance: governedTokenAccount?.governance,
    additionalSerializedInstructions,
    shouldSplitIntoSeparateTxs: true,
  }

  return obj
}
