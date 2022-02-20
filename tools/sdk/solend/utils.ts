import { PublicKey } from '@solana/web3.js'

import SolendConfiguration from './configuration'

export async function deriveObligationAddressFromWalletAndSeed(
  walletAddress: PublicKey
) {
  return PublicKey.createWithSeed(
    walletAddress,
    SolendConfiguration.createObligationConfiguration.seed,
    SolendConfiguration.programID
  )
}
