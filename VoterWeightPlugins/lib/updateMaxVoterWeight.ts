import {
  PublicKey,
  TransactionInstruction,
} from '@solana/web3.js'
import {VoterWeightPluginInfo} from "./types";

interface UpdateMaxVoterWeightRecordArgs {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  plugins?: VoterWeightPluginInfo[]
}

export const updateMaxVoterWeight = async ({
  realmPublicKey,
  governanceMintPublicKey,
  plugins = [],
}: UpdateMaxVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  const ixes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const updateMaxVoterWeightRecordIx = await plugin.client.updateMaxVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey
    )
    if (updateMaxVoterWeightRecordIx) ixes.push(updateMaxVoterWeightRecordIx)
  }
  return ixes
}
