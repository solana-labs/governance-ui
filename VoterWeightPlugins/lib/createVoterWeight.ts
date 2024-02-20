import {
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {VoterWeightPluginInfo} from "./types";

interface CreateVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  plugins?: VoterWeightPluginInfo[]
}

export const createVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey,
  plugins = [],
}: CreateVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  const ixes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const client = plugin.client

    const voterWeightRecord = await client.getVoterWeightRecord(
        realmPublicKey,
        governanceMintPublicKey,
        walletPublicKey
    )

    if (!voterWeightRecord) {
      const ix = await client.createVoterWeightRecord(
          walletPublicKey,
          realmPublicKey,
          governanceMintPublicKey
      )
      if (ix) ixes.push(ix)
    }
  }
  return ixes
}
