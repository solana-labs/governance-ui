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
      realmInfo,
      realmTokenAccount,
      symbol,
      toManyCommunityOutstandingProposalsForUser,
      toManyCouncilOutstandingProposalsForUse,
      vsrMode,
    ]
  )
}
