import { PublicKey, Connection } from '@solana/web3.js'
import { fetchRealmConfigQuery } from '@hooks/queries/realmConfig'
import { findPluginName, PluginName } from '@constants/plugins'
import { loadClient } from '../clients/'
import {Provider} from '@coral-xyz/anchor'
import { getRegistrarPDA as getPluginRegistrarPDA } from '@utils/plugin/accounts'
import {PluginType, VoterWeightPluginInfo} from './types'
import BN from 'bn.js'
import {fetchRealmByPubkey} from "@hooks/queries/realm";

const getInitialPluginProgramId = async (
    realmPublicKey: PublicKey,
    governanceMintPublicKey: PublicKey,
    connection: Connection,
    type: PluginType
):Promise<PublicKey | undefined> => {
  const config = await fetchRealmConfigQuery(connection, realmPublicKey)
  const realm = await fetchRealmByPubkey(connection, realmPublicKey)
  const kind = realm.result?.account.communityMint.equals(governanceMintPublicKey) ? "community" : "council"

  const governanceConfig = config.result?.account?.[
      kind === 'community' ? 'communityTokenConfig' : 'councilTokenConfig'];
  return type === 'voterWeight' ? governanceConfig?.voterWeightAddin : governanceConfig?.maxVoterWeightAddin;
}

export const getPlugins = async ({
                                   realmPublicKey,
                                   governanceMintPublicKey,
                                   provider,
                                   type
                                 }: {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  provider: Provider
  type: PluginType
}): Promise<VoterWeightPluginInfo[]> => {
  const plugins: VoterWeightPluginInfo[] = []
  let programId = await getInitialPluginProgramId(realmPublicKey, governanceMintPublicKey, provider.connection, type)

  if (programId) {
    // build plugin list till we get null, which means we are at the end of the plugin chain
    do {
      const pluginName = findPluginName(programId)
      const client = await loadClient(
          pluginName as PluginName,
          programId,
          provider
      )

      // obtain the currently stored on-chain voter weight or max voter weight depending on the passed-in type
      let weight: BN | undefined;
      if (type === 'voterWeight') {
        const voterWeightRecord = (await client.getVoterWeightRecord(
            realmPublicKey,
            governanceMintPublicKey,
            provider.publicKey
        )) as { voterWeight: BN } | null
        weight = voterWeightRecord?.voterWeight
      } else {
        const maxVoterWeightRecord = (await client.getMaxVoterWeightRecord(
            realmPublicKey,
            governanceMintPublicKey
        )) as { maxVoterWeight: BN } | null
        weight = maxVoterWeightRecord?.maxVoterWeight
      }

      const { registrar: registrarPublicKey } = getPluginRegistrarPDA(
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
        type,
        weight,
        registrarPublicKey,
        params: registrarData ?? {},
      })

      programId = registrarData?.previousVoterWeightPluginProgramId;
    } while (programId)
  }

  return plugins.reverse()
}
