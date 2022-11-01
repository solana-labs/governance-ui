import { Treasury } from '@mean-dao/msp'
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
import createMsp from './createMsp'

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
  const additionalSerializedInstructions = [] as string[]

  const formTreasury = form.treasury as Treasury | undefined

  if (
    isValid &&
    governedTokenAccount &&
    formTreasury &&
    form.amount &&
    governedTokenAccount.extensions.mint
  ) {
    const msp = createMsp(connection)
    const payer = getGovernedAccountPk(governedTokenAccount)
    const contributor = payer
    const mint = governedTokenAccount.extensions.mint.publicKey
    const treasury = new PublicKey(formTreasury.id)
    const amount = parseMintNaturalAmountFromDecimal(
      form.amount,
      governedTokenAccount.extensions.mint.account.decimals
    )
    const transaction = await msp.addFunds(
      payer,
      contributor,
      treasury,
      mint,
      amount
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
