import { PublicKey, Connection, Keypair } from '@solana/web3.js'
import { fetchRealmConfigQuery } from '@hooks/queries/realmConfig'
import { findPluginName, PluginName } from '@constants/plugins'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import {
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'
import { loadClient } from './loadClient'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'

export const getPredecessorProgramId = async (
  client: GatewayClient | QuadraticClient,
  realmPublicKey: PublicKey,
  governanceMintPublicKey: PublicKey
): Promise<PublicKey | null> => {
  // Get the registrar for the realm
  const { registrar } = await getRegistrarPDA(
    realmPublicKey,
    governanceMintPublicKey,
    client.program.programId
  )
  const registrarObject = await client.program.account.registrar.fetch(
    registrar
  )

  // Find the gatekeeper network from the registrar
  return registrarObject.previousVoterWeightPluginProgramId
}

export const getPlugins = async (
  realmPublicKey: PublicKey,
  governanceMintPublicKey: PublicKey, // TODO, if this is the council mint, get plugins for the council governance instead of community
  connection: Connection
): Promise<string[]> => {
  const config = await fetchRealmConfigQuery(connection, realmPublicKey)
  const plugins: PluginName[] = []

  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    connection,
    new EmptyWallet(Keypair.generate()),
    options
  )

  let programId = config.result?.account?.communityTokenConfig?.voterWeightAddin

  let pluginName = ''

  if (programId) {
    // build plugin list till we get null, which means we are at the end of the plugin chain

    do {
      pluginName = findPluginName(programId)
      if (pluginName) {
        plugins.push(pluginName as PluginName)
      }

      const client = await loadClient(pluginName as PluginName, provider)
      // @ts-ignore
      programId = await getPredecessorProgramId(
        client,
        realmPublicKey,
        governanceMintPublicKey
      )
    } while (pluginName !== null && programId !== null)
  }

  return plugins
}
