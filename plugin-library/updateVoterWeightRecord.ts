import {
  PublicKey,
  TransactionInstruction,
  Keypair,
  Connection,
} from '@solana/web3.js'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { getPlugins } from './getPlugins'
import { PluginName } from '@constants/plugins'
import { loadClient } from './loadClient'

interface UpdateVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  connection: Connection
}

export const updateVoterWeightRecord = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey, // this will be the community mint for most use cases.
  connection,
}: UpdateVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
  // Connect to the cluster

  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    connection,
    new EmptyWallet(Keypair.generate()),
    options
  )

  const plugins = await getPlugins({
    realmPublicKey,
    governanceMintPublicKey,
    connection,
  })
  const ixes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const client = await loadClient(plugin.name as PluginName, provider)

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
      ixes.push(ix)
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

    // update the voter weight record
    const updateVoterWeightRecordIx = await client.updateVoterWeightRecord(
      walletPublicKey,
      realmPublicKey,
      governanceMintPublicKey
    )
    ixes.push(updateVoterWeightRecordIx)

    const updateMaxVoterWeightRecordIx = await client.updateMaxVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey
    )
    if (updateMaxVoterWeightRecordIx) ixes.push(updateMaxVoterWeightRecordIx)
  }
  return ixes
}
