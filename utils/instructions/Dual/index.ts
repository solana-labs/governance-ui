import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

import { StakingOptions } from '@dual-finance/staking-options'
import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceStakingOptionForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import {
  createAssociatedTokenAccount,
  findAssociatedTokenAddress,
} from '@utils/associated'
import { tryGetTokenAccount } from '@utils/tokens'
import { WalletAdapter } from '@solana/wallet-adapter-base'

interface Args {
  connection: ConnectionContext
  form: DualFinanceStakingOptionForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

function getStakingOptionsApi(connection: ConnectionContext) {
  return new StakingOptions(connection.endpoint, 'confirmed')
}

export default async function getConfigInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: Args): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  let additionalSerializedInstructions: string[] = []

  if (
    isValid &&
    form.soName &&
    form.baseTreasury &&
    form.quoteTreasury &&
    form.payer &&
    form.userPk &&
    wallet?.publicKey
  ) {
    const so = getStakingOptionsApi(connection)
    const baseTreasuryAccount = await tryGetTokenAccount(
      connection.current,
      form.baseTreasury.pubkey
    )
    const baseMint = baseTreasuryAccount?.account.mint
    const quoteTreasuryAccount = await tryGetTokenAccount(
      connection.current,
      form.quoteTreasury.pubkey
    )
    const quoteMint = quoteTreasuryAccount?.account.mint

    if (!baseMint || !quoteMint) {
      return {
        serializedInstruction,
        isValid: false,
        governance: form.baseTreasury?.governance,
        additionalSerializedInstructions: [],
        chunkSplitByDefault: true,
        chunkBy: 1,
      }
    }

    const configInstruction = await so.createConfigInstruction(
      form.optionExpirationUnixSeconds,
      form.optionExpirationUnixSeconds,
      form.numTokens,
      form.lotSize,
      form.soName,
      form.payer.pubkey,
      baseMint,
      form.baseTreasury.pubkey,
      quoteMint,
      form.quoteTreasury.pubkey
    )

    additionalSerializedInstructions = additionalSerializedInstructions.concat(
      serializeInstructionToBase64(configInstruction)
    )

    const initStrikeInstruction = await so.createInitStrikeInstruction(
      form.strike,
      form.soName,
      form.payer.pubkey,
      baseMint
    )
    additionalSerializedInstructions = additionalSerializedInstructions.concat(
      serializeInstructionToBase64(initStrikeInstruction)
    )

    const soMint = await so.soMint(form.strike, form.soName, baseMint)
    const userSoAccount = await findAssociatedTokenAddress(
      new PublicKey(form.userPk),
      soMint
    )

    if (!(await connection.current.getAccountInfo(userSoAccount))) {
      const [ataIx] = await createAssociatedTokenAccount(
        wallet.publicKey,
        new PublicKey(form.userPk),
        soMint
      )
      additionalSerializedInstructions = additionalSerializedInstructions.concat(
        serializeInstructionToBase64(ataIx)
      )
    }

    const issueInstruction = await so.createIssueInstruction(
      form.numTokens,
      form.strike,
      form.soName,
      form.payer.pubkey,
      baseMint,
      userSoAccount
    )

    additionalSerializedInstructions = additionalSerializedInstructions.concat(
      serializeInstructionToBase64(issueInstruction)
    )

    const obj: UiInstruction = {
      serializedInstruction,
      isValid: true,
      governance: form.baseTreasury?.governance,
      additionalSerializedInstructions,
      chunkSplitByDefault: true,
      chunkBy: 1,
    }
    return obj
  }

  const obj: UiInstruction = {
    serializedInstruction,
    isValid: false,
    governance: form.baseTreasury?.governance,
    additionalSerializedInstructions,
    chunkSplitByDefault: true,
    chunkBy: 1,
  }
  return obj
}
