import {
  PublicKey,
  TransactionInstruction,
  Keypair,
  Connection,
} from '@solana/web3.js'
import {
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'
import { AnchorProvider } from '@coral-xyz/anchor'
import { Provider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'

const PLUGIN_NAMES = ['quadratic', 'gateway']

interface UpdateVoterWeightRecordArgs {
  walletPublicKey: PublicKey
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  connection: Connection
}

const loadClient = (
  plugin: typeof PLUGIN_NAMES[number],
  provider: Provider
) => {
  switch (plugin) {
    case 'quadratic':
      return QuadraticClient.connect(provider)
    case 'gateway':
      return GatewayClient.connect(provider)
    default:
      throw new Error(`Unsupported plugin ${plugin}`)
  }
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
  console.log('provider', provider)

  // TODO fetch this from the realm governance and perform step checking on each plugin
  const pluginName = 'gateway'
  // Get the plugin client
  const client = await loadClient(pluginName, provider)

  // check if the voter weight record exists already. If not, create it.
  const ixes: TransactionInstruction[] = []

  const voterWeightRecord = await client.getVoterWeightRecord(
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey
  )
  if (!voterWeightRecord) {
    console.log('creating voter weight record')
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
    console.log('creating max voter weight record')
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

  return ixes
}
