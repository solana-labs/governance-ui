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
  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    connection,
    new EmptyWallet(Keypair.generate()),
    options
  )

  const plugins = await getPlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
    connection,
  })
  const ixes: TransactionInstruction[] = []

  for (const plugin of plugins) {
    const client = await loadClient(plugin.name as PluginName, provider)

    const updateMaxVoterWeightRecordIx = await client.updateMaxVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey
    )
    if (updateMaxVoterWeightRecordIx) ixes.push(updateMaxVoterWeightRecordIx)
  }
  return ixes
}
