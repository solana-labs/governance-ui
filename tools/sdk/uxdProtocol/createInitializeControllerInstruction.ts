import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { uxdClient } from './uxdClient'

const createInitializeControllerInstruction = (
  uxdProgramId: PublicKey,
  mintSymbol: string,
  mintDecimals: number,
  authority: PublicKey,
  payer: PublicKey,
  connection: Connection
): TransactionInstruction => {
  const { client, controller } = uxdClient(connection, uxdProgramId)

  return client.createInitializeControllerInstruction(
    controller,
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createInitializeControllerInstruction
