import { Stream } from '@mean-dao/msp'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  MeanTransferStream,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import createMsp from './createMsp'

interface Args {
  connection: ConnectionContext
  form: MeanTransferStream
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
  const formStream = form.stream as Stream | undefined

  if (isValid && governedTokenAccount && formStream && form.destination) {
    const msp = createMsp(connection)

    const beneficiary = getGovernedAccountPk(governedTokenAccount)

    const stream = new PublicKey(formStream.id)
    const newBeneficiary = new PublicKey(form.destination)

    const transaction = await msp.transferStream(
      beneficiary,
      newBeneficiary,
      stream
    )
    transaction.instructions.map((i) =>
      additionalSerializedInstructions.push(serializeInstructionToBase64(i))
    )

    const obj: UiInstruction = {
      serializedInstruction,
      isValid: true,
      governance: governedTokenAccount?.governance,
      additionalSerializedInstructions,
      shouldSplitIntoSeparateTxs: true,
    }
    return obj
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: governedTokenAccount?.governance,
    additionalSerializedInstructions,
    shouldSplitIntoSeparateTxs: true,
  }

  return obj
}
