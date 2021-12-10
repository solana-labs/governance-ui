import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { uxdClient } from './uxdClient'

const createSetRedeemableGlobalSupplyCapInstruction = (
  connection: Connection,
  uxdProgramId: PublicKey,
  supplyCapUiAmount: number,
  authority: PublicKey
): TransactionInstruction => {
  const { client, controller } = uxdClient(connection, uxdProgramId)
  return client.createSetRedeemableGlobalSupplyCapInstruction(
    controller,
    authority,
    supplyCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetRedeemableGlobalSupplyCapInstruction
