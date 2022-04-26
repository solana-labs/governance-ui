import { BN, PublicKey } from '@blockworks-foundation/mango-client'
import { ProgramAccount, TokenOwnerRecord } from '@solana/spl-governance'
import { isPublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { useMemo, useState } from 'react'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import {
  createUnchartedRealmInfo,
  getCertifiedRealmInfo,
  RealmInfo,
} from '../models/registry/api'
import {
  VoteNftWeight,
  VoteRegistryVoterWeight,
  VoterWeight,
} from '../models/voteWeights'
import useMembersStore from 'stores/useMembersStore'

import useWalletStore from '../stores/useWalletStore'
import { nftPluginsPks, vsrPluginsPks } from './useVotingPlugins'

export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const tokenAccounts = useWalletStore((s) => s.tokenAccounts)
  const {
    realm,
    mint,
    councilMint,
    governances,
    proposals,
    tokenRecords,
    councilTokenOwnerRecords,
    programVersion,
    config,
  } = useWalletStore((s) => s.selectedRealm)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const nftVotingPower = useNftPluginStore((s) => s.state.votingPower)
  const [realmInfo, setRealmInfo] = useState<RealmInfo | undefined>(undefined)
  const delegates = useMembersStore((s) => s.compact.delegates)

  useMemo(async () => {
    let realmInfo = isPublicKey(symbol as string)
      ? realm
        ? // Realm program data needs to contain config options to enable/disable things such as notifications
          // Currently defaulting to false here for now
          createUnchartedRealmInfo(realm)
        : undefined
      : getCertifiedRealmInfo(symbol as string, connection)

    if (realmInfo) {
      realmInfo = { ...realmInfo, programVersion: programVersion }
    }
    // Do not set realm info until the programVersion  is resolved
    if (programVersion) {
      setRealmInfo(realmInfo)
    }
  }, [symbol, realm, programVersion])

  const realmTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts.find((a) =>
        a.account.mint.equals(realm.account.communityMint)
      ),
    [realm, tokenAccounts]
  )

  const ownTokenRecord = useMemo(() => {
    if (wallet?.connected && wallet.publicKey) {
      const walletId = wallet.publicKey.toBase58()

      // if users wallet has token, use that
      if (tokenRecords[walletId]) {
        return tokenRecords[walletId]
      }

      // if they don't have a token, but are delegated a token, use that
      const delegatedWallets = delegates && delegates[walletId]
      if (delegatedWallets?.communityMembers) {
        const firstDelegate = delegatedWallets.communityMembers[0]
        return tokenRecords[firstDelegate.walletAddress]
      }
      return tokenRecords[walletId]
    }

    return undefined
  }, [tokenRecords, wallet, connected])

  const councilTokenAccount = useMemo(
    () =>
      realm &&
      councilMint &&
      tokenAccounts.find(
        (a) =>
          realm.account.config.councilMint &&
          a.account.mint.equals(realm.account.config.councilMint)
      ),
    [realm, tokenAccounts]
  )

  const ownCouncilTokenRecord = useMemo(() => {
    if (wallet?.connected && councilMint && wallet.publicKey) {
      const walletId = wallet.publicKey.toBase58()
      // if users wallet has token, use that
      if (councilTokenOwnerRecords[walletId]) {
        return councilTokenOwnerRecords[walletId]
      }

      // if they don't have a token, but are delegated a token, use that
      const delegatedWallets = delegates && delegates[walletId]
      if (delegatedWallets?.councilMembers) {
        const firstDelegate = delegatedWallets.councilMembers[0]
        return councilTokenOwnerRecords[firstDelegate.walletAddress]
      }
    }
    return undefined
  }, [tokenRecords, wallet, connected])

  const canChooseWhoVote =
    realm?.account.communityMint &&
    (!mint?.supply.isZero() ||
      realm.account.config.useCommunityVoterWeightAddin) &&
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

  const currentPluginPk = config?.account?.communityVoterWeightAddin

  const ownVoterWeight = getVoterWeight(
    currentPluginPk,
    ownTokenRecord,
    votingPower,
    nftVotingPower,
    ownCouncilTokenRecord
  )

  return {
    realm,
    realmInfo,
    symbol,
    mint,
    councilMint,
    governances,
    proposals,
    tokenRecords,
    realmTokenAccount,
    ownTokenRecord,
    councilTokenAccount,
    ownCouncilTokenRecord,
    ownVoterWeight,
    realmDisplayName: realmInfo?.displayName ?? realm?.account?.name,
    canChooseWhoVote,
    councilTokenOwnerRecords,
    toManyCouncilOutstandingProposalsForUse,
    toManyCommunityOutstandingProposalsForUser,
    config,
  }
}

const getVoterWeight = (
  currentPluginPk: PublicKey | undefined,
  ownTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined,
  votingPower: BN,
  nftVotingPower: BN,
  ownCouncilTokenRecord: ProgramAccount<TokenOwnerRecord> | undefined
) => {
  if (currentPluginPk) {
    if (vsrPluginsPks.includes(currentPluginPk.toBase58())) {
      return new VoteRegistryVoterWeight(ownTokenRecord, votingPower)
    }
    if (nftPluginsPks.includes(currentPluginPk.toBase58())) {
      return new VoteNftWeight(
        ownTokenRecord,
        ownCouncilTokenRecord,
        nftVotingPower
      )
    }
  }
  return new VoterWeight(ownTokenRecord, ownCouncilTokenRecord)
}
