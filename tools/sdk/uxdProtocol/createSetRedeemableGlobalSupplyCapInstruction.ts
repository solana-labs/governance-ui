import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { getControllerPda, uxdClient } from './uxdClient'

const createSetRedeemableGlobalSupplyCapInstruction = (
  uxdProgramId: PublicKey,
  supplyCapUiAmount: number,
  authority: PublicKey
): TransactionInstruction => {
  const client = uxdClient(uxdProgramId)

  return client.createSetRedeemableGlobalSupplyCapInstruction(
    { pda: getControllerPda(uxdProgramId) } as Controller,
    authority,
    supplyCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetRedeemableGlobalSupplyCapInstruction
