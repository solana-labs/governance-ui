import { isPublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'
import {
  createUnchartedRealmInfo,
  getCertifiedRealmInfo,
  RealmInfo,
} from '../models/registry/api'
import { VoteRegistryVoterWeight, VoterWeight } from '../models/voteWeights'

import useWalletStore from '../stores/useWalletStore'

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
    tokenMints,
    tokenAccounts: realmTokenAccounts,
    proposals,
    tokenRecords,
    councilTokenOwnerRecords,
    programVersion,
  } = useWalletStore((s) => s.selectedRealm)
  const votingPower = useDepositStore((s) => s.state.votingPower)
  const [realmInfo, setRealmInfo] = useState<RealmInfo | undefined>(undefined)
  useMemo(async () => {
    let realmInfo = isPublicKey(symbol as string)
      ? realm
        ? createUnchartedRealmInfo(realm)
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

  const ownTokenRecord = useMemo(
    () =>
      wallet?.connected && wallet.publicKey
        ? tokenRecords[wallet.publicKey.toBase58()]
        : undefined,
    [tokenRecords, wallet, connected]
  )

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

  const ownCouncilTokenRecord = useMemo(
    () =>
      wallet?.connected && councilMint && wallet.publicKey
        ? councilTokenOwnerRecords[wallet.publicKey.toBase58()]
        : undefined,
    [tokenRecords, wallet, connected]
  )

  const canChooseWhoVote =
    realm?.account.communityMint &&
    !mint?.supply.isZero() &&
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

  //TODO change when more plugins implemented
  const ownVoterWeight = realm?.account.config.useCommunityVoterWeightAddin
    ? new VoteRegistryVoterWeight(ownTokenRecord, votingPower)
    : new VoterWeight(ownTokenRecord, ownCouncilTokenRecord)
  return {
    realm,
    realmInfo,
    symbol,
    mint,
    councilMint,
    governances,
    realmTokenAccounts,
    tokenMints,
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
  }
}
