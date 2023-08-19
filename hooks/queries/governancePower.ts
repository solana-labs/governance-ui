import { Connection, PublicKey } from '@solana/web3.js'
import { fetchTokenOwnerRecordByPubkey } from './tokenOwnerRecord'
import BN from 'bn.js'
import { fetchNftRegistrar } from './plugins/nftVoter'
import { fetchDigitalAssetsByOwner } from './digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { ON_NFT_VOTER_V2 } from '@constants/flags'
import { fetchRealmByPubkey } from './realm'
import { fetchRealmConfigQuery } from './realmConfig'
import {
  GATEWAY_PLUGINS_PKS,
  HELIUM_VSR_PLUGINS_PKS,
  NFT_PLUGINS_PKS,
  VSR_PLUGIN_PKS,
} from '@constants/plugins'

export const getVanillaGovpower = async (
  connection: Connection,
  tokenOwnerRecord: PublicKey
) => {
  const torAccount = await fetchTokenOwnerRecordByPubkey(
    connection,
    tokenOwnerRecord
  )
  return torAccount.result
    ? torAccount.result.account.governingTokenDepositAmount
    : new BN(0)
}

export const getNftGovpower = async (
  connection: Connection,
  realmPk: PublicKey,
  tokenOwnerRecordPk: PublicKey
) => {
  // figure out what collections are used
  const { result: registrar } = await fetchNftRegistrar(connection, realmPk)
  if (registrar === undefined) throw new Error()
  const { collectionConfigs } = registrar

  // grab the owner of the TOR
  const { result: TOR } = await fetchTokenOwnerRecordByPubkey(
    connection,
    tokenOwnerRecordPk
  )
  if (TOR === undefined) throw new Error()
  const owner = TOR.account.governingTokenOwner

  // grab the user nfts
  const network = getNetworkFromEndpoint(connection.rpcEndpoint)
  if (network === 'localnet') throw new Error()
  const nfts = (await fetchDigitalAssetsByOwner(network, owner))
    // filter cnfts if not supported yet
    .filter((nft) => ON_NFT_VOTER_V2 || !nft.compression.compressed)

  // map nfts to power and sum them
  const power = nfts
    .map(
      (nft) =>
        // find collectionConfig such that the nft's `collection` grouping matches the collection id
        collectionConfigs.find(
          (x) =>
            x.collection.equals(
              new PublicKey(
                nft.grouping.find((y) => y.group_key === 'collection')
                  ?.group_value ?? 'dummy value hehehe'
              )
            )
          // take the weight for that collection, or 0 if the nft matches none of the dao's collections
        )?.weight ?? new BN(0)
    )
    // sum
    .reduce((partialSum, a) => partialSum.add(a), new BN(0))

  return power
}

export const determineVotingPowerType = async (
  connection: Connection,
  realmPk: PublicKey,
  kind: 'council' | 'community'
) => {
  const realm = (await fetchRealmByPubkey(connection, realmPk)).result
  if (!realm) throw new Error()

  const config = await fetchRealmConfigQuery(connection, realmPk)
  const programId =
    kind === 'community'
      ? config.result?.account.communityTokenConfig.voterWeightAddin
      : config.result?.account.councilTokenConfig.voterWeightAddin

  return programId === undefined
    ? ('vanilla' as const)
    : VSR_PLUGIN_PKS.includes(programId.toString())
    ? ('VSR' as const)
    : HELIUM_VSR_PLUGINS_PKS.includes(programId.toString())
    ? 'HeliumVSR'
    : NFT_PLUGINS_PKS.includes(programId.toString())
    ? 'NFT'
    : GATEWAY_PLUGINS_PKS.includes(programId.toString())
    ? 'gateway'
    : 'unknown'
}
