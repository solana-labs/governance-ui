import {
  PublicKey,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js'
import { getPlugins } from './getPlugins'

interface CreateMaxVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  connection: Connection
}

export const createMaxVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey, // this will be the community mint for most use cases.
  connection,
}: CreateMaxVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  // TODO pass in
  const plugins = await getPlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
    connection,
  })
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
