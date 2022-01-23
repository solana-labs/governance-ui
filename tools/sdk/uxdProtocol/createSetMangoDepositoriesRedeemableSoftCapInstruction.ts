import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { instantiateController, uxdClient } from './uxdClient'

const createSetMangoDepositoriesRedeemableSoftCapInstruction = (
  uxdProgramId: PublicKey,
  softCapUiAmount: number,
  authority: PublicKey
): TransactionInstruction => {
  const client = uxdClient(uxdProgramId)
  return client.createSetMangoDepositoriesRedeemableSoftCapInstruction(
    instantiateController(uxdProgramId),
    authority,
    softCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetMangoDepositoriesRedeemableSoftCapInstruction
