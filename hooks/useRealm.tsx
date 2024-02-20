import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { NFT_PLUGINS_PKS } from '../constants/plugins'
import { useVsrMode } from './useVsrMode'
import { useRealmQuery } from './queries/realm'
import {
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './queries/tokenOwnerRecord'
import { useRealmConfigQuery } from './queries/realmConfig'
import { useSelectedRealmInfo } from './selectedRealm/useSelectedRealmRegistryEntry'
import { useUserTokenAccountsQuery } from './queries/tokenAccount'
import {useRealmVoterWeights} from "@hooks/useRealmVoterWeightPlugins";
import BN from "bn.js";
import {GovernanceRole} from "../@types/types";

/**
 * @deprecated This hook has been broken up into many smaller hooks, use those instead, DO NOT use this
 */
export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query

  const { data: tokenAccounts } = useUserTokenAccountsQuery()
  const realm = useRealmQuery().data?.result
  const realmInfo = useSelectedRealmInfo()

  // if the realm has community and council tokens, both with non-zero weights, the proposer can choose which should be used to vote
  const { communityMaxWeight, councilMaxWeight } = useRealmVoterWeights()
  const availableVoteGovernanceOptions = [
      communityMaxWeight?.value?.gt(new BN(0)) ? 'community' : undefined,
        councilMaxWeight?.value?.gt(new BN(0)) ? 'council' : undefined
  ].filter(Boolean) as GovernanceRole[]; // filter out undefined

  const config = useRealmConfigQuery().data?.result
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
      /** @deprecated use useUserGovTokenAccount */
      realmTokenAccount,
      /** @deprecated use useUserGovTokenAccount */
      councilTokenAccount,
      /** @deprecated just use the token owner record directly, ok? */
      //ownVoterWeight,
      //realmDisplayName: realmInfo?.displayName ?? realm?.account?.name,
      availableVoteGovernanceOptions,
      //councilTokenOwnerRecords,
      toManyCouncilOutstandingProposalsForUse,
      toManyCommunityOutstandingProposalsForUser,

      //config,
      currentPluginPk,
      vsrMode,
      isNftMode,
    }),
    [
      availableVoteGovernanceOptions,
      councilTokenAccount,
      currentPluginPk,
      isNftMode,
      realmInfo,
      realmTokenAccount,
      symbol,
      toManyCommunityOutstandingProposalsForUser,
      toManyCouncilOutstandingProposalsForUse,
      vsrMode,
    ]
  )
}
