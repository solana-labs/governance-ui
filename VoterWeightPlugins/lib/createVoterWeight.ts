import {
  PublicKey,
  TransactionInstruction,
  Connection,
} from '@solana/web3.js'
import { getPlugins } from './getPlugins'

interface CreateVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  connection: Connection
}

export const createVoterWeight = async ({
                                          walletPublicKey,
                                          realmPublicKey,
                                          governanceMintPublicKey, // this will be the community mint for most use cases.
                                          connection,
                                        }: CreateVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  const plugins = await getPlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
    connection,
  })
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
