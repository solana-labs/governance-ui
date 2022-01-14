import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { instantiateController, uxdClient } from './uxdClient'

const createInitializeControllerInstruction = (
  uxdProgramId: PublicKey,
  mintDecimals: number,
  authority: PublicKey,
  payer: PublicKey
): TransactionInstruction => {
  const client = uxdClient(uxdProgramId)

  return client.createInitializeControllerInstruction(
    instantiateController(uxdProgramId, mintDecimals),
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createInitializeControllerInstruction
