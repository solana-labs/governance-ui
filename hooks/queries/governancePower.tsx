import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import {
  fetchTokenOwnerRecordByPubkey,
  useTokenOwnerRecordByPubkeyQuery,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './tokenOwnerRecord'
import BN from 'bn.js'
import { fetchDigitalAssetsByOwner } from './digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { ON_NFT_VOTER_V2 } from '@constants/flags'
import { fetchRealmByPubkey, useRealmQuery } from './realm'
import { fetchRealmConfigQuery } from './realmConfig'
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
import useUserOrDelegator from '@hooks/useUserOrDelegator'
import { getVsrGovpower, useVsrGovpower } from './plugins/vsr'
import { PythClient } from '@pythnetwork/staking'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import { findPluginName } from '@constants/plugins'
import { nftRegistrarQuery } from './plugins/nftVoter'
import queryClient from './queryClient'

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

export const useVanillaGovpower = (tokenOwnerRecordPk: PublicKey) => {
  const { data: torAccount } = useTokenOwnerRecordByPubkeyQuery(
    tokenOwnerRecordPk
  )
  return torAccount?.result
    ? torAccount.result.account.governingTokenDepositAmount
    : new BN(0)
}

export const getNftGovpower = async (
  connection: Connection,
  realmPk: PublicKey,
  tokenOwnerRecordPk: PublicKey
) => {
  // figure out what collections are used
  const { result: registrar } = await queryClient.fetchQuery(
    nftRegistrarQuery(connection, realmPk)
  )
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
            x.collection.toString() ===
            (nft.grouping.find((y) => y.group_key === 'collection')
              ?.group_value ?? false)
          // take the weight for that collection, or 0 if the nft matches none of the dao's collections
        )?.weight ?? new BN(0)
    )
    // sum
    .reduce((partialSum, a) => partialSum.add(a), new BN(0))

  return power
}

export const getPythGovPower = async (
  connection: Connection,
  user: PublicKey | undefined
): Promise<BN> => {
  if (!user) return new BN(0)

  const pythClient = await PythClient.connect(
    connection,
    new NodeWallet(new Keypair())
  )
  const stakeAccount = await pythClient.getMainAccount(user)

  if (stakeAccount) {
    return stakeAccount.getVoterWeight(await pythClient.getTime()).toBN()
  } else {
    return new BN(0)
  }
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

  return findPluginName(programId)
}

// TODO use HOC to provide voting power to components that need voting power without knowing plugin
// this is an efficiency thing to save on queries, since we can't have conditional useQuery hooks.
// i guess you can just use the enabled flag..
/* 
export const WithCommunityGovernancePower = <
  P extends { communityGovernancePower: BN | undefined }
>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'communityGovernancePower'>> =>
  function Enhanced(props) {
    const { connection } = useConnection()
    const kind = 'community'
    const realmPk = useSelectedRealmPubkey()

    const { result: plugin } = useAsync(
      async () =>
        kind && realmPk && determineVotingPowerType(connection, realmPk, kind),
      [connection, realmPk, kind]
    )
    // this `props as P` thing is annoying!! ts should know better -@asktree
    return <Component {...(props as P)} />
  }

export const WithVsrGovernancePower = <
  P extends { communityGovernancePower: BN | undefined }
>(
  Component: React.ComponentType<P>
): React.FC<Omit<P, 'communityGovernancePower'>> =>
  function Enhanced(props) {
    const communityGovernancePower = useVsrGovpower().data?.result

    // this `props as P` thing is annoying!! ts should know better -@asktree
    return (
      <Component
        {...(props as P)}
        communityGovernancePower={communityGovernancePower}
      />
    )
  } */

/** where possible avoid using this and use a plugin-specific hook instead */
export const useGovernancePowerAsync = (
  kind: 'community' | 'council' | undefined
) => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()

  const heliumVotingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)
  const vsrVotingPower = useVsrGovpower().data?.result

  const communityTOR = useAddressQuery_CommunityTokenOwner()
  const councilTOR = useAddressQuery_CouncilTokenOwner()
  const { data: TOR } = kind && kind === 'community' ? communityTOR : councilTOR

  const { result: plugin } = useAsync(
    async () =>
      kind && realmPk && determineVotingPowerType(connection, realmPk, kind),
    [connection, realmPk, kind]
  )
  const actingAsWalletPk = useUserOrDelegator()

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
            ? vsrVotingPower ?? new BN(0)
            : plugin === 'HeliumVSR'
            ? heliumVotingPower
            : plugin === 'gateway'
            ? gatewayVotingPower
            : plugin === 'pyth'
            ? getPythGovPower(connection, actingAsWalletPk)
            : new BN(0)),
    [
      plugin,
      realmPk,
      TOR,
      connection,
      vsrVotingPower,
      heliumVotingPower,
      gatewayVotingPower,
      actingAsWalletPk,
    ]
  )
}

/**
 * @deprecated
 * use useGovernancePowerAsync
 */
export const useLegacyVoterWeight = () => {
  const { connection } = useConnection()
  const realmPk = useSelectedRealmPubkey()
  const realm = useRealmQuery().data?.result

  const heliumVotingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)

  const { data: communityTOR } = useUserCommunityTokenOwnerRecord()
  const { data: councilTOR } = useUserCouncilTokenOwnerRecord()

  const { result: plugin } = useAsync(
    async () =>
      realmPk && determineVotingPowerType(connection, realmPk, 'community'),
    [connection, realmPk]
  )
  const actingAsWalletPk = useUserOrDelegator()

  const shouldCareAboutCouncil =
    realm && realm.account.config.councilMint !== undefined

  return useAsync(
    async () =>
      realmPk &&
      communityTOR &&
      (shouldCareAboutCouncil === undefined
        ? undefined
        : shouldCareAboutCouncil === true && councilTOR === undefined
        ? undefined
        : plugin === 'vanilla'
        ? new VoterWeight(communityTOR.result, councilTOR?.result)
        : plugin === 'pyth'
        ? new VoteRegistryVoterWeight(
            communityTOR.result,
            councilTOR?.result,
            await getPythGovPower(connection, actingAsWalletPk)
          )
        : plugin === 'NFT'
        ? communityTOR.result?.pubkey
          ? new VoteNftWeight(
              communityTOR.result,
              councilTOR?.result,
              await getNftGovpower(
                connection,
                realmPk,
                communityTOR.result.pubkey
              )
            )
          : undefined
        : plugin === 'VSR'
        ? actingAsWalletPk
          ? new VoteRegistryVoterWeight(
              communityTOR.result,
              councilTOR?.result,
              (await getVsrGovpower(connection, realmPk, actingAsWalletPk))
                .result ?? new BN(0)
            )
          : undefined
        : plugin === 'HeliumVSR'
        ? new VoteRegistryVoterWeight(
            communityTOR.result,
            councilTOR?.result,
            heliumVotingPower
          )
        : plugin === 'gateway'
        ? new SimpleGatedVoterWeight(
            communityTOR.result,
            councilTOR?.result,
            gatewayVotingPower
          )
        : undefined),

    [
      actingAsWalletPk,
      communityTOR,
      connection,
      councilTOR,
      gatewayVotingPower,
      heliumVotingPower,
      plugin,
      realmPk,
      shouldCareAboutCouncil,
    ]
  )
}
