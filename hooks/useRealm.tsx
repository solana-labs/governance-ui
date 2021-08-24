import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo } from 'react'
import { RealmInfo } from '../@types/types'
import useWalletStore from '../stores/useWalletStore'

export const REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
    realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
  },
]

export default function useRealm(symbol: string) {
  const { fetchAllRealms, fetchRealm } = useWalletStore((s) => s.actions)
  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const tokenAccounts = useWalletStore((s) => s.tokenAccounts)
  const {
    realm,
    mint,
    governances,
    proposals,
    tokenRecords,
    votes,
  } = useWalletStore((s) => s.selectedRealm)

  const realmInfo = useMemo(() => REALMS.find((r) => r.symbol === symbol), [
    symbol,
  ])

  useEffect(() => {
    const fetch = async () => {
      if (realmInfo) {
        await fetchAllRealms(realmInfo.programId)
        fetchRealm(realmInfo.programId, realmInfo.realmId)
      }
    }
    fetch()
  }, [realmInfo])

  const realmTokenAccount = useMemo(
    () =>
      realm &&
      tokenAccounts.find((a) =>
        a.account.mint.equals(realm.info.communityMint)
      ),
    [realm, tokenAccounts]
  )

  const ownTokenRecord = useMemo(
    () => wallet?.connected && tokenRecords[wallet.publicKey.toBase58()],
    [tokenRecords, wallet, connected]
  )

  return {
    realm,
    realmInfo,
    mint,
    governances,
    proposals,
    tokenRecords,
    votes,
    realmTokenAccount,
    ownTokenRecord,
  }
}
