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
  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    connection,
    new EmptyWallet(Keypair.generate()),
    options
  )

  // TODO pass in
  const plugins = await getPlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
    connection,
  })
  const ixes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const client = await loadClient(plugin.name as PluginName, provider)

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
