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

export const updateVoterWeight = async ({
  walletPublicKey,
  realmPublicKey,
  governanceMintPublicKey, // this will be the community mint for most use cases.
  connection,
}: UpdateVoterWeightRecordArgs): Promise<TransactionInstruction[]> => {
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

    const updateVoterWeightRecordIx = await client.updateVoterWeightRecord(
      walletPublicKey,
      realmPublicKey,
      governanceMintPublicKey
    )
    ixes.push(updateVoterWeightRecordIx)
  }
  return ixes
}
