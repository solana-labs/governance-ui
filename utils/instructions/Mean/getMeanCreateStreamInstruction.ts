import { Treasury } from '@mean-dao/msp'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import { AssetAccount } from '@utils/uiTypes/assets'
import {
  MeanCreateStream,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import createMsp from './createMsp'

interface Args {
  connection: ConnectionContext
  form: MeanCreateStream
  setFormErrors: any // TODO
  schema: any // TODO
}

function getGovernedAccountPk(acc: AssetAccount): PublicKey {
  return (acc.isSol
    ? acc.extensions.transferAddress
    : acc.extensions?.token?.account?.owner) as PublicKey
}

const getRateIntervalInSeconds = (
  interval: MeanCreateStream['rateInterval']
) => {
  switch (interval) {
    case 0:
      return 60
    case 1:
      return 3600
    case 2:
      return 86400
    case 3:
      return 604800
    case 4:
      return 2629750
    case 5:
      return 31557000
  }
}

export default async function getMeanCreateStreamInstruction({
  connection,
  form,
  schema,
  setFormErrors,
}: //setFormErrors
Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const governedTokenAccount = form.governedTokenAccount

  const formTreasury = form.treasury as Treasury | undefined

  if (
    isValid &&
    governedTokenAccount &&
    formTreasury &&
    form.destination &&
    form.streamName &&
    governedTokenAccount.extensions.mint &&
    form.allocationAssigned &&
    form.rateAmount &&
    form.mintInfo
  ) {
    const msp = createMsp(connection)

    const payer = getGovernedAccountPk(governedTokenAccount)
    const treasurer = governedTokenAccount.governance.pubkey
    const treasury = new PublicKey(formTreasury.id)
    const beneficiary = new PublicKey(form.destination)
    const streamName = form.streamName
    const allocationAssigned = parseMintNaturalAmountFromDecimal(
      form.allocationAssigned,
      form.mintInfo.decimals
    )
    const rateAmount = parseMintNaturalAmountFromDecimal(
      form.rateAmount,
      form.mintInfo.decimals
    )
    const rateIntervalInSeconds = getRateIntervalInSeconds(form.rateInterval)
    const startUtc = new Date(form.startDate)
    const usePda = true

    const transaction = await msp.createStream(
      payer,
      treasurer,
      treasury,
      beneficiary,
      streamName,
      allocationAssigned,
      rateAmount,
      rateIntervalInSeconds,
      startUtc,
      undefined,
      undefined,
      undefined,
      usePda
    )

    const additionalSerializedInstructions = transaction.instructions.map(
      serializeInstructionToBase64
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
    additionalSerializedInstructions: [],
    shouldSplitIntoSeparateTxs: true,
  }

  return obj
}
