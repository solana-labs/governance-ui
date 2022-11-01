import { TreasuryType } from '@mean-dao/msp'
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
}: Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const governedTokenAccount = form.governedTokenAccount
  const additionalSerializedInstructions = [] as string[]

  if (
    isValid &&
    governedTokenAccount &&
    form.label &&
    form.amount &&
    governedTokenAccount.extensions.mint
  ) {
    const msp = createMsp(connection)
    const payer = getGovernedAccountPk(governedTokenAccount)
    const mint = governedTokenAccount.extensions.mint.publicKey
    const label = form.label
    const treasurer = governedTokenAccount.governance.pubkey

    const type = form.type === 0 ? TreasuryType.Open : TreasuryType.Lock

    const [transaction1, treasuryPublicKey] = await msp.createTreasury2(
      payer,
      treasurer,
      mint,
      label,
      type
    )

    const contributor = payer
    const treasury = treasuryPublicKey

    const amount = parseMintNaturalAmountFromDecimal(
      form.amount,
      governedTokenAccount.extensions.mint.account.decimals
    )
    const transaction2 = await msp.addFunds(
      payer,
      contributor,
      treasury,
      mint,
      amount
    )

    transaction1.instructions.map((i) =>
      additionalSerializedInstructions.push(serializeInstructionToBase64(i))
    )
    transaction2.instructions.map((i) =>
      additionalSerializedInstructions.push(serializeInstructionToBase64(i))
    )

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
    additionalSerializedInstructions,
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}
