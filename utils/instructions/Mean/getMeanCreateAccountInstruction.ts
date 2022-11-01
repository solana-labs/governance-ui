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
  if (
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

    console.log({
      payer,
      treasurer,
      mint,
      label,
      type,
      transaction1,
      treasuryPublicKey,
    })
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
    console.log({
      payer,
      contributor,
      treasury,
      mint,
      amount,
      instructions1: transaction1.instructions,
      instructions2: transaction2.instructions,
    })
    transaction1.instructions.map((i) =>
      additionalSerializedInstructions.push(serializeInstructionToBase64(i))
    )
    transaction2.instructions.map((i) =>
      additionalSerializedInstructions.push(serializeInstructionToBase64(i))
    )
    console.log(additionalSerializedInstructions.map((e) => e.length))

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
    isValid,
    governance: governedTokenAccount?.governance,
    additionalSerializedInstructions,
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}
