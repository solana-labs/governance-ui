import { Treasury } from '@mean-dao/msp'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { parseMintNaturalAmountFromDecimal } from '@tools/sdk/units'
import { validateInstruction } from '@utils/instructionTools'
import { ConnectionContext } from '@utils/connection'
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
  console.log('!!!!!')
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const governedTokenAccount = form.governedTokenAccount
  const additionalSerializedInstructions = [] as string[]

  const formTreasury = form.treasury as Treasury | undefined
  console.log({
    isValid,
    governedTokenAccount: governedTokenAccount,
    formTreasury: formTreasury,
    'form.destination': form.destination,
    'form.streamName': form.streamName,
    'governedTokenAccount.extensions.mint':
      governedTokenAccount?.extensions.mint,
    'form.allocationAssigned': form.allocationAssigned,
    'form.rateAmount ': form.rateAmount,
  })
  if (
    governedTokenAccount &&
    formTreasury &&
    form.destination &&
    form.streamName &&
    governedTokenAccount.extensions.mint &&
    form.allocationAssigned &&
    form.rateAmount
  ) {
    const msp = createMsp(connection)

    const payer = getGovernedAccountPk(governedTokenAccount)
    const treasurer = governedTokenAccount.governance.pubkey
    const treasury = new PublicKey(formTreasury.id)
    const beneficiary = new PublicKey(form.destination)
    const streamName = form.streamName
    const allocationAssigned = parseMintNaturalAmountFromDecimal(
      form.allocationAssigned,
      governedTokenAccount.extensions.mint.account.decimals
    )
    const rateAmount = parseMintNaturalAmountFromDecimal(
      form.rateAmount,
      governedTokenAccount.extensions.mint.account.decimals
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
    console.log({
      payer,
      treasurer,
      treasury,
      beneficiary,
      streamName,
      allocationAssigned,
      rateAmount,
      rateIntervalInSeconds,
      startUtc,
      usePda,
    })
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
