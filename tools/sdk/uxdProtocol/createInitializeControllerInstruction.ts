import { Provider } from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { instantiateController, uxdClient } from './uxdClient'

const createInitializeControllerInstruction = (
  uxdProgramId: PublicKey,
  mintDecimals: number,
  authority: PublicKey,
  payer: PublicKey,
  connection: Connection,
  wallet: SignerWalletAdapter
): TransactionInstruction => {
  const client = uxdClient(connection, uxdProgramId, wallet)

  return client.createInitializeControllerInstruction(
    instantiateController(uxdProgramId, mintDecimals),
    authority,
    Provider.defaultOptions(),
    payer
  )
}

export default createInitializeControllerInstruction
