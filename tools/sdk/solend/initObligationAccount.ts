import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { initObligationInstruction } from '@solendprotocol/solend-sdk'
import SolendConfiguration from './configuration'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function initObligationAccount({
  obligationOwner,
}: {
  obligationOwner: PublicKey
}): Promise<TransactionInstruction> {
  const obligationAddress = await deriveObligationAddressFromWalletAndSeed(
    obligationOwner
  )

  return initObligationInstruction(
    obligationAddress,
    SolendConfiguration.lendingMarket,
    obligationOwner,
    SolendConfiguration.programID
  )
}
