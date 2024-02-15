import {
  PublicKey,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js'
import { getPlugins } from './getPlugins'

interface UpdateMaxVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  connection: Connection
}

export const updateMaxVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey, // this will be the community mint for most use cases.
  connection,
}: UpdateMaxVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  const plugins = await getPlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
    connection,
  })
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
