import { Provider } from '@project-serum/anchor'
import { TransactionInstruction, PublicKey } from '@solana/web3.js'
import { Controller } from '@uxdprotocol/uxd-client'
import { getControllerPda, uxdClient } from './uxdClient'

const createSetMangoDepositoriesRedeemableSoftCapInstruction = (
  uxdProgramId: PublicKey,
  softCapUiAmount: number,
  authority: PublicKey
): TransactionInstruction => {
  const client = uxdClient(uxdProgramId)

  return client.createSetMangoDepositoriesRedeemableSoftCapInstruction(
    { pda: getControllerPda(uxdProgramId) } as Controller,
    authority,
    softCapUiAmount,
    Provider.defaultOptions()
  )
}

export default createSetMangoDepositoriesRedeemableSoftCapInstruction
