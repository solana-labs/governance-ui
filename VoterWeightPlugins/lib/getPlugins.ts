import { PublicKey, Connection } from '@solana/web3.js'
import { fetchRealmConfigQuery } from '@hooks/queries/realmConfig'
import { findPluginName, PluginName } from '@constants/plugins'
import { loadClient } from '../clients/'
import { AnchorProvider } from '@coral-xyz/anchor'
import { getRegistrarPDA as getPluginRegistrarPDA } from '@utils/plugin/accounts'
import { VoterWeightPluginInfo } from './types'
import BN from 'bn.js'
import {fetchRealmByPubkey} from "@hooks/queries/realm";

const getInitialPluginProgramId = async (
    realmPublicKey: PublicKey,
    governanceMintPublicKey: PublicKey,
    connection: Connection
):Promise<PublicKey | undefined> => {
  const config = await fetchRealmConfigQuery(connection, realmPublicKey)
  const realm = await fetchRealmByPubkey(connection, realmPublicKey)
  const kind = realm.result?.account.communityMint.equals(governanceMintPublicKey) ? "community" : "council"

  return config.result?.account?.[
      kind === 'community' ? 'communityTokenConfig' : 'councilTokenConfig']
      ?.voterWeightAddin
}

export const getPlugins = async ({
  realmPublicKey,
  governanceMintPublicKey,
  provider
}: {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  provider: AnchorProvider
}): Promise<VoterWeightPluginInfo[]> => {
  const plugins: VoterWeightPluginInfo[] = []
  let programId = await getInitialPluginProgramId(realmPublicKey, governanceMintPublicKey, provider.connection)

  let pluginName = ''

  if (programId) {
    // build plugin list till we get null, which means we are at the end of the plugin chain
    do {
      pluginName = findPluginName(programId)
      if (pluginName) {
        const client = await loadClient(
          pluginName as PluginName,
          programId,
          provider
        )

        const voterWeightRecord = (await client.getVoterWeightRecord(
          realmPublicKey,
          governanceMintPublicKey,
          provider.publicKey
        )) as { voterWeight: BN } | null // TODO fix up typing on these clients
        const maxVoterWeightRecord = (await client.getMaxVoterWeightRecord(
          realmPublicKey,
          governanceMintPublicKey
        )) as { maxVoterWeight: BN } | null // TODO fix up typing on these clients

        const { registrar: registrarPublicKey } = await getPluginRegistrarPDA(
          realmPublicKey,
          governanceMintPublicKey,
          programId
        )

        const registrarData = await client.getRegistrarAccount(
          realmPublicKey,
          governanceMintPublicKey
        )

        plugins.push({
          client,
          programId,
          name: pluginName as PluginName,
          voterWeight: voterWeightRecord?.voterWeight,
          maxVoterWeight: maxVoterWeightRecord?.maxVoterWeight,
          registrarPublicKey,
          params: registrarData ?? {},
        })

        programId = registrarData?.previousVoterWeightPluginProgramId;
      }
    } while (programId)
  }

  return plugins.reverse()
}
