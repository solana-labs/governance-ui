import { Provider } from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { uxdClient } from './uxdClient'

const createSetMangoDepositoriesRedeemableSoftCapInstruction = (
  connection: Connection,
  uxdProgramId: PublicKey,
  softCapUiAmount: number,
  authority: PublicKey,
  controllerPda: PublicKey,
  wallet: SignerWalletAdapter
): TransactionInstruction => {
  const client = uxdClient(connection, uxdProgramId, wallet)

  return client.createSetMangoDepositoriesRedeemableSoftCapInstruction(
    { pda: controllerPda } as Controller,
    authority,
    softCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetMangoDepositoriesRedeemableSoftCapInstruction
