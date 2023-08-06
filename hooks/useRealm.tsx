import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { useMemo } from 'react'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import {
  SimpleGatedVoterWeight,
  VoteNftWeight,
  VoteRegistryVoterWeight,
  VoterWeight,
} from '../models/voteWeights'
import {
  NFT_PLUGINS_PKS,
  VSR_PLUGIN_PKS,
  GATEWAY_PLUGINS_PKS,
  HELIUM_VSR_PLUGINS_PKS,
} from '../constants/plugins'
import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import { BN } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import { useVsrMode } from './useVsrMode'
import { useRealmQuery } from './queries/realm'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './queries/tokenOwnerRecord'
import { useRealmConfigQuery } from './queries/realmConfig'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from './queries/mintInfo'
import { useSelectedRealmInfo } from './selectedRealm/useSelectedRealmRegistryEntry'
import { useUserTokenAccountsQuery } from './queries/tokenAccount'

/**
 * @deprecated This hook has been broken up into many smaller hooks, use those instead, DO NOT use this
 */
export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query

  const { data: tokenAccounts } = useUserTokenAccountsQuery()
  const realm = useRealmQuery().data?.result
  const realmInfo = useSelectedRealmInfo()

  const config = useRealmConfigQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result

  const votingPower = useDepositStore((s) => s.state.votingPower)
  const heliumVotingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const nftVotingPower = useNftPluginStore((s) => s.state.votingPower)
  const gatewayVotingPower = useGatewayPluginStore((s) => s.state.votingPower)
  const currentPluginPk = config?.account?.communityTokenConfig.voterWeightAddin

  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const ownCouncilTokenRecord = useUserCouncilTokenOwnerRecord().data?.result

  const realmTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts?.find((a) =>
        a.account.mint.equals(realm.account.communityMint)
      ),
    [realm, tokenAccounts]
  )

  const councilTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts?.find(
        (a) =>
          realm.account.config.councilMint &&
          a.account.mint.equals(realm.account.config.councilMint)
      ),
    [realm, tokenAccounts]
  )

  const canChooseWhoVote =
    realm?.account.communityMint &&
    (!mint?.supply.isZero() ||
      config?.account.communityTokenConfig.voterWeightAddin) &&
    realm.account.config.councilMint &&
    !councilMint?.supply.isZero()

  //TODO take from realm config when available
  const realmCfgMaxOutstandingProposalCount = 10
  const toManyCommunityOutstandingProposalsForUser =
    ownTokenRecord &&
    ownTokenRecord?.account.outstandingProposalCount >=
      realmCfgMaxOutstandingProposalCount
  const toManyCouncilOutstandingProposalsForUse =
    ownCouncilTokenRecord &&
    ownCouncilTokenRecord?.account.outstandingProposalCount >=
      realmCfgMaxOutstandingProposalCount
  const vsrMode = useVsrMode()
  const isNftMode =
    currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())
  const ownVoterWeight = getVoterWeight(
    currentPluginPk,
    ownTokenRecord,
    votingPower,
    nftVotingPower,
    gatewayVotingPower,
    ownCouncilTokenRecord,
    heliumVotingPower
  )

  return useMemo(
    () => ({
      /** @deprecated use useRealmQuery */
      //    realm,
      /** @deprecated use useSelectedRealmInfo
       * Legacy hook structure, I suggest using useSelectedRealmRegistryEntry if you want the resgistry entry and useRealmQuery for on-chain data
       */
      realmInfo,
      /** @deprecated just use `useRouter().query` directly... */
      symbol,
      //voteSymbol: realmInfo?.voteSymbol,
      //mint,
      //councilMint,
      //governances,
      /** @deprecated use useRealmProposalsQuery */
      //proposals,
      //tokenRecords,
      realmTokenAccount,
      councilTokenAccount,
      /** @deprecated just use the token owner record directly, ok? */
      ownVoterWeight,
      //realmDisplayName: realmInfo?.displayName ?? realm?.account?.name,
      canChooseWhoVote,
      //councilTokenOwnerRecords,
      toManyCouncilOutstandingProposalsForUse,
      toManyCommunityOutstandingProposalsForUser,

      //config,
      currentPluginPk,
      vsrMode,
      isNftMode,
    }),
    [
      canChooseWhoVote,
      councilTokenAccount,
      currentPluginPk,
      isNftMode,

      ownVoterWeight,
      realmInfo,
      realmTokenAccount,
      symbol,
      toManyCommunityOutstandingProposalsForUser,
      toManyCouncilOutstandingProposalsForUse,
      vsrMode,
    ]
  )
}

const getVoterWeight = (
  currentPluginPk: PublicKey | undefined,
  ownTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  votingPower: BN,
  nftVotingPower: BN,
  gatewayVotingPower: BN,
  ownCouncilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  heliumVotingPower: BN
) => {
  if (currentPluginPk) {
    if (VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        votingPower
      )
    }
    if (HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        heliumVotingPower
      )
    }
    if (NFT_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new VoteNftWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        nftVotingPower
      )
    }

    if (GATEWAY_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
      return new SimpleGatedVoterWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        gatewayVotingPower
      )
    }
  }
  return new VoterWeight(ownTokenRecord, ownCouncilTokenRecord)
}
