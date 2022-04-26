import { PublicKey, SystemProgram } from '@solana/web3.js'
import SolendConfiguration from './configuration'
import { deriveObligationAddressFromWalletAndSeed } from './utils'

export async function createObligationAccount({
  fundingAddress,
  walletAddress,
}: {
  fundingAddress: PublicKey
  walletAddress: PublicKey
}) {
  const newAccountPubkey = await deriveObligationAddressFromWalletAndSeed(
    walletAddress
  )

  const { seed, lamports, space } =
    SolendConfiguration.createObligationConfiguration

  return SystemProgram.createAccountWithSeed({
    basePubkey: walletAddress,
    fromPubkey: fundingAddress,
    newAccountPubkey,
    programId: SolendConfiguration.programID,
    seed,
    lamports,
    space,
  })
}
