import { isPublicKey } from '@tools/core/pubkey'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import {
  createUnchartedRealmInfo,
  getCertifiedRealmInfo,
  RealmInfo,
} from '../models/registry/api'
import { VoterWeight } from '../models/voteWeights'

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
    proposalDescriptions,
    tokenRecords,
    councilTokenOwnerRecords,
  } = useWalletStore((s) => s.selectedRealm)
  const [realmInfo, setRealmInfo] = useState<RealmInfo | undefined>(undefined)

  useMemo(async () => {
    const realmInfo = isPublicKey(symbol as string)
      ? realm
        ? createUnchartedRealmInfo(realm)
        : undefined
      : await getCertifiedRealmInfo(symbol as string, connection)
    setRealmInfo(realmInfo)
  }, [symbol, realm])

  const realmTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts.find((a) =>
        a.account.mint.equals(realm.info.communityMint)
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
          realm.info.config.councilMint &&
          a.account.mint.equals(realm.info.config.councilMint)
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
    realm?.info.communityMint &&
    !mint?.supply.isZero() &&
    realm.info.config.councilMint &&
    !councilMint?.supply.isZero()

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
    proposalDescriptions,
    tokenRecords,
    realmTokenAccount,
    ownTokenRecord,
    councilTokenAccount,
    ownCouncilTokenRecord,
    ownVoterWeight: new VoterWeight(ownTokenRecord, ownCouncilTokenRecord),
    realmDisplayName: realmInfo?.displayName ?? realm?.info?.name,
    canChooseWhoVote,
    councilTokenOwnerRecords,
  }
}
