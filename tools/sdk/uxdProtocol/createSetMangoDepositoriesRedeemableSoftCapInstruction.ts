import { Provider } from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { getControllerPda, uxdClient } from './uxdClient'

const createSetMangoDepositoriesRedeemableSoftCapInstruction = (
  connection: Connection,
  uxdProgramId: PublicKey,
  softCapUiAmount: number,
  authority: PublicKey,
  wallet: SignerWalletAdapter
): TransactionInstruction => {
  const client = uxdClient(connection, uxdProgramId, wallet)

  return client.createSetMangoDepositoriesRedeemableSoftCapInstruction(
    { pda: getControllerPda(uxdProgramId) } as Controller,
    authority,
    softCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetMangoDepositoriesRedeemableSoftCapInstruction
