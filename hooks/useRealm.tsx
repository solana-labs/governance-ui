import { PublicKey } from '@solana/web3.js'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { RealmInfo } from '../@types/types'
import useWalletStore from '../stores/useWalletStore'

export const REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    endpoint: 'mainnet',
    programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
    realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
  },
  {
    symbol: 'MNGO-DEV',
    endpoint: 'devnet',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('H2iny4dUP2ngt9p4niUWVX4TKvr1h9eSWGNdP1zvwzNQ'),
  },
]

export default function useRealm() {
  const router = useRouter()
  const { symbol } = router.query

  const connected = useWalletStore((s) => s.connected)
  const wallet = useWalletStore((s) => s.current)
  const tokenAccounts = useWalletStore((s) => s.tokenAccounts)
  const {
    realm,
    mint,
    governances,
    proposals,
    proposalDescriptions,
    tokenRecords,
  } = useWalletStore((s) => s.selectedRealm)

  const realmInfo = useMemo(() => REALMS.find((r) => r.symbol === symbol), [
    symbol,
  ])

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
    symbol,
    mint,
    governances,
    proposals,
    proposalDescriptions,
    tokenRecords,
    realmTokenAccount,
    ownTokenRecord,
  }
}
