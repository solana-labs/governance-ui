import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { instantiateController, uxdClient } from './uxdClient'

const createSetRedeemableGlobalSupplyCapInstruction = (
  uxdProgramId: PublicKey,
  supplyCapUiAmount: number,
  authority: PublicKey
): TransactionInstruction => {
  const client = uxdClient(uxdProgramId)
  return client.createSetRedeemableGlobalSupplyCapInstruction(
    instantiateController(uxdProgramId),
    authority,
    supplyCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetRedeemableGlobalSupplyCapInstruction
