import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { uxdClient } from './uxdClient'

const createInitializeControllerInstruction = (
  uxdProgramId: PublicKey,
  mintDecimals: number,
  authority: PublicKey,
  payer: PublicKey,
  connection: Connection
): TransactionInstruction => {
  const client = uxdClient(connection, uxdProgramId)

  const controller = new Controller(
    'redeemableTicker',
    mintDecimals,
    uxdProgramId
  )

  return client.createInitializeControllerInstruction(
    controller,
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createInitializeControllerInstruction
