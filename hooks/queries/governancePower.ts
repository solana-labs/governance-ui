import { Connection, PublicKey } from '@solana/web3.js'
import {
  fetchTokenOwnerRecordByPubkey,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './tokenOwnerRecord'
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
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import useGatewayPluginStore from 'GatewayPlugin/store/gatewayPluginStore'
import { useAsync } from 'react-async-hook'
import { useConnection } from '@solana/wallet-adapter-react'
import useSelectedRealmPubkey from '@hooks/selectedRealm/useSelectedRealmPubkey'
import {
  useAddressQuery_CommunityTokenOwner,
  useAddressQuery_CouncilTokenOwner,
} from './addresses/tokenOwnerRecord'
import {
  SimpleGatedVoterWeight,
  VoteNftWeight,
  VoteRegistryVoterWeight,
  VoterWeight,
} from '@models/voteWeights'

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

export const useGovernancePowerAsync = (
  kind: 'community' | 'council' | undefined
) => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()

  const vsrVotingPower = useDepositStore((s) => s.state.votingPower)
  const heliumVotingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)

  const communityTOR = useAddressQuery_CommunityTokenOwner()
  const councilTOR = useAddressQuery_CouncilTokenOwner()
  const { data: TOR } = kind && kind === 'community' ? communityTOR : councilTOR

  const { result: plugin } = useAsync(
    async () =>
      kind && realmPk && determineVotingPowerType(connection, realmPk, kind),
    [connection, realmPk, kind]
  )

  return useAsync(
    async () =>
      plugin === undefined
        ? undefined
        : realmPk &&
          TOR &&
          (plugin === 'vanilla'
            ? getVanillaGovpower(connection, TOR)
            : plugin === 'NFT'
            ? getNftGovpower(connection, realmPk, TOR)
            : plugin === 'VSR'
            ? vsrVotingPower
            : plugin === 'HeliumVSR'
            ? heliumVotingPower
            : plugin === 'gateway'
            ? gatewayVotingPower
            : new BN(0)),
    [realmPk, TOR, plugin, connection]
  )
}

/**
 * @deprecated
 * use useGovernancePowerAsync
 */
export const useLegacyVoterWeight = () => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()

  const vsrVotingPower = useDepositStore((s) => s.state.votingPower)
  const heliumVotingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)

  const communityTOR = useUserCommunityTokenOwnerRecord().data?.result
  const councilTOR = useUserCouncilTokenOwnerRecord().data

  const { result: plugin } = useAsync(
    async () =>
      realmPk && determineVotingPowerType(connection, realmPk, 'community'),
    [connection, realmPk]
  )

  return useAsync(
    async () =>
      realmPk &&
      communityTOR &&
      councilTOR &&
      (plugin === 'vanilla'
        ? new VoterWeight(communityTOR, councilTOR?.result)
        : plugin === 'NFT'
        ? new VoteNftWeight(
            communityTOR,
            councilTOR.result,
            await getNftGovpower(connection, realmPk, communityTOR.pubkey)
          )
        : plugin === 'VSR'
        ? new VoteRegistryVoterWeight(
            communityTOR,
            councilTOR.result,
            vsrVotingPower
          )
        : plugin === 'HeliumVSR'
        ? new VoteRegistryVoterWeight(
            communityTOR,
            councilTOR.result,
            heliumVotingPower
          )
        : plugin === 'gateway'
        ? new SimpleGatedVoterWeight(
            communityTOR,
            councilTOR.result,
            gatewayVotingPower
          )
        : undefined),
    [realmPk, communityTOR, councilTOR, plugin, connection]
  )
}
