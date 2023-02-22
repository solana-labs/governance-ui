import {
  serializeInstructionToBase64,
} from '@solana/spl-governance'

import { ConnectionContext } from '@utils/connection'
import { validateInstruction } from '@utils/instructionTools'
import {
  DualFinanceAirdropForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { WalletAdapter } from '@solana/wallet-adapter-base'
import { Airdrop, AirdropConfigureContext } from '@dual-finance/airdrop'
import { Keypair } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { getMintDecimalAmount, getMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'

interface AirdropArgs {
  connection: ConnectionContext
  form: DualFinanceAirdropForm
  setFormErrors: any
  schema: any
  wallet: WalletAdapter | undefined
}

export async function getAirdropInstruction({
  connection,
  wallet,
  form,
  schema,
  setFormErrors,
}: AirdropArgs): Promise<UiInstruction> {
  const isValid = await validateInstruction({ schema, form, setFormErrors })

  const serializedInstruction = ''
  const additionalSerializedInstructions: string[] = []
  if (isValid && form.treasury && wallet?.publicKey && form.treasury.extensions.mint?.account.decimals) {
    const airdrop = new Airdrop(connection.endpoint)

    const amountNatural: BN  = getMintNaturalAmountFromDecimalAsBN(
        form.amount,
        form.treasury.extensions.mint?.account.decimals
    );

    const root = form.root.split(',').map(function(item) {
        return parseInt(item, 10);
    });
    const airdropTransactionContext: AirdropConfigureContext = await airdrop.createConfigMerkleTransactionFromRoot(
        form.treasury.pubkey, // source
        form.treasury.extensions.token!.account.owner!, // authority
        amountNatural,
        root,
    );

    for (const instruction of airdropTransactionContext.transaction.instructions) {
        additionalSerializedInstructions.push(
            serializeInstructionToBase64(instruction)
        )
    }

    return {
      serializedInstruction,
      additionalSerializedInstructions,
      signers: airdropTransactionContext.signers as Keypair[],
      isValid: true,
      governance: form.treasury?.governance,
    }
  }

  return {
    serializedInstruction,
    isValid: false,
    governance: form.treasury?.governance,
    additionalSerializedInstructions: [],
  }
}
