import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { getRealmInfo } from '../models/registry/api'
import { EndpointTypes } from '../models/types'
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

  const realmInfo = useMemo(
    () => getRealmInfo(symbol as string, connection.endpoint as EndpointTypes),
    [symbol]
  )

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
  }
}
