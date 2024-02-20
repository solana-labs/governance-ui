import {
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {VoterWeightPluginInfo} from "./types";

interface CreateMaxVoterWeightRecordArgs {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  plugins?: VoterWeightPluginInfo[]
}

export const createMaxVoterWeight = async ({
  realmPublicKey,
  governanceMintPublicKey,
  plugins = [],
}: CreateMaxVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  const ixes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const client = plugin.client

    const voterWeightRecord = await client.getMaxVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey,
    )

    if (!voterWeightRecord) {
      const ix = await client.createMaxVoterWeightRecord(
        realmPublicKey,
        governanceMintPublicKey
      )
      if (ix) ixes.push(ix)
    }

    const maxVoterWeightRecord = await client.getMaxVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey
    )
    if (!maxVoterWeightRecord) {
      const ix = await client.createMaxVoterWeightRecord(
        realmPublicKey,
        governanceMintPublicKey
      )
      if (ix) ixes.push(ix)
    }
  }
  return ixes
}
