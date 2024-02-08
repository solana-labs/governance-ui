import { PublicKey, Connection, Keypair } from '@solana/web3.js'
import { fetchRealmConfigQuery } from '@hooks/queries/realmConfig'
import { findPluginName, PluginName } from '@constants/plugins'
import { getRegistrarPDA } from '@utils/plugin/accounts'
import { BN } from '@coral-xyz/anchor'
import {
  GatewayClient,
  QuadraticClient,
} from '@solana/governance-program-library'
import { loadClient } from './loadClient'
import { AnchorProvider } from '@coral-xyz/anchor'
import EmptyWallet from '@utils/Mango/listingTools'
import { getRegistrarPDA as getPluginRegistrarPDA } from '@utils/plugin/accounts'

export interface PluginData {
  programId: PublicKey
  name: PluginName | undefined // you may need undefined here to allow "unknown" plugins
  params: any // the most challenging one- probably a typed data structure of some kind, that is related to the plugin, e.g. QV plugin has params: { coefficients: number[] }, Gateway plugin has params: { gatekeeperNetwork: Plugin } - these would come from the registrar
  voterWeight: BN // the weight after applying this plugin (taken from the voter's voterWeightRecord account)
  maxVoterWeight: BN | undefined // see above - can be undefined if the plugin does not set a max vw
  registrarPublicKey: PublicKey
  client: QuadraticClient | QuadraticClient
}

export const getPredecessorProgramId = async (
  client: GatewayClient | QuadraticClient, // TODO: Add other clients once we support them
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

export const getPlugins = async ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
  connection,
}: {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  walletPublicKey: PublicKey
  connection: Connection
}): Promise<PluginData[]> => {
  const config = await fetchRealmConfigQuery(connection, realmPublicKey)
  const plugins: PluginData[] = []

  const options = AnchorProvider.defaultOptions()
  const provider = new AnchorProvider(
    connection,
    new EmptyWallet(Keypair.generate()),
    options
  )

  let programId =
    config.result?.account?.communityTokenConfig?.voterWeightAddin ?? null

  let pluginName = ''

  if (programId) {
    // build plugin list till we get null, which means we are at the end of the plugin chain

    do {
      pluginName = findPluginName(programId)
      if (pluginName) {
        const client = await loadClient(pluginName as PluginName, provider)

        const voterWeight = await client.getVoterWeightRecord(
          realmPublicKey,
          governanceMintPublicKey,
          walletPublicKey
        )

        const { registrar } = await getPluginRegistrarPDA(
          realmPublicKey,
          governanceMintPublicKey,
          programId
        )

        const registrarData = await client.program.account.registrar.fetch(
          registrar
        )

        plugins.push({
          // @ts-ignore issue with client types
          client: client,
          programId: programId,
          name: pluginName as PluginName,
          voterWeight: voterWeight?.voterWeight,
          maxVoterWeight: undefined, // TODO, fetch this for other clients
          registrarPublicKey: registrar,
          params: {
            ...registrarData,
          },
        })

        programId = await getPredecessorProgramId(
          client,
          realmPublicKey,
          governanceMintPublicKey
        )
      }
    } while (pluginName !== null && programId !== null)
  }

  return plugins
}
