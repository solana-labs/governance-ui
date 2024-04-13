import { PublicKey, Connection } from '@solana/web3.js'
import { fetchRealmConfigQuery } from '@hooks/queries/realmConfig'
import { findPluginName, PluginName } from '@constants/plugins'
import { loadClient } from '../clients/'
import { Provider, Wallet } from '@coral-xyz/anchor'
import { getRegistrarPDA as getPluginRegistrarPDA } from '@utils/plugin/accounts'
import { PluginType, VoterWeightPluginInfo } from './types'
import BN from 'bn.js'
import { fetchRealmByPubkey } from '@hooks/queries/realm'

const getInitialPluginProgramId = async (
  realmPublicKey: PublicKey,
  governanceMintPublicKey: PublicKey,
  connection: Connection,
  type: PluginType
): Promise<PublicKey | undefined> => {
  const config = await fetchRealmConfigQuery(connection, realmPublicKey)
  const realm = await fetchRealmByPubkey(connection, realmPublicKey)
  const kind = realm.result?.account.communityMint.equals(
    governanceMintPublicKey
  )
    ? 'community'
    : 'council'

  const governanceConfig =
    config.result?.account?.[
      kind === 'community' ? 'communityTokenConfig' : 'councilTokenConfig'
    ]
  return type === 'voterWeight'
    ? governanceConfig?.voterWeightAddin
    : governanceConfig?.maxVoterWeightAddin
}

const weightForWallet = async (
  client: any,
  realmPublicKey: PublicKey,
  governanceMintPublicKey: PublicKey,
  wallet: PublicKey,
  type: PluginType
): Promise<BN | undefined> => {
  if (type === 'voterWeight') {
    const voterWeightRecord = (await client.getVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey,
      wallet
    )) as { voterWeight: BN } | null
    return voterWeightRecord?.voterWeight
  } else {
    // this is slightly inefficient, since this section does not depend on the input wallet
    // For wallets with a large amount of delegators, it might be noticeable if caching is not happening correctly.
    // If so, it should be optimised.
    const maxVoterWeightRecord = (await client.getMaxVoterWeightRecord(
      realmPublicKey,
      governanceMintPublicKey
    )) as { maxVoterWeight: BN } | null
    return maxVoterWeightRecord?.maxVoterWeight
  }
}

export const getPlugins = async ({
  realmPublicKey,
  governanceMintPublicKey,
  provider,
  type,
  wallets,
  signer,
}: {
  realmPublicKey: PublicKey
  governanceMintPublicKey: PublicKey
  provider: Provider
  type: PluginType
  wallets: PublicKey[]
  signer: Wallet
}): Promise<VoterWeightPluginInfo[]> => {
  const plugins: VoterWeightPluginInfo[] = []
  let programId = await getInitialPluginProgramId(
    realmPublicKey,
    governanceMintPublicKey,
    provider.connection,
    type
  )

  if (programId) {
    // build plugin list till we get null, which means we are at the end of the plugin chain
    do {
      const pluginName = findPluginName(programId)
      const client = await loadClient(
        pluginName as PluginName,
        programId,
        provider,
        signer
      )

      // obtain the currently stored on-chain voter weight or max voter weight depending on the passed-in type
      const weights: (BN | undefined)[] = await Promise.all(
        wallets.map((wallet) =>
          weightForWallet(
            client,
            realmPublicKey,
            governanceMintPublicKey,
            wallet,
            type
          )
        )
      )

      const { registrar: registrarPublicKey } = getPluginRegistrarPDA(
        realmPublicKey,
        governanceMintPublicKey,
        programId,
        pluginName
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
        weights,
        registrarPublicKey,
        params: registrarData ?? {},
      })

      programId = registrarData?.previousVoterWeightPluginProgramId
    } while (programId)
  }

  return plugins.reverse()
}
