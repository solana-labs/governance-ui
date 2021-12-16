import { Provider } from '@project-serum/anchor'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { TransactionInstruction, PublicKey, Connection } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { uxdClient } from './uxdClient'

const createSetRedeemableGlobalSupplyCapInstruction = (
  connection: Connection,
  uxdProgramId: PublicKey,
  supplyCapUiAmount: number,
  authority: PublicKey,
  controllerPda: PublicKey,
  wallet: SignerWalletAdapter
): TransactionInstruction => {
  const client = uxdClient(connection, uxdProgramId, wallet)

  return client.createSetRedeemableGlobalSupplyCapInstruction(
    { pda: controllerPda } as Controller,
    authority,
    supplyCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetRedeemableGlobalSupplyCapInstruction
