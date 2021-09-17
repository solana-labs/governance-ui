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
    website: 'https://mango.markets',
    keywords:
      'Mango Markets, DAO, Governance, Serum, SRM, Serum DEX, DEFI, Decentralized Finance, Decentralised Finance, Crypto, ERC20, Ethereum, Decentralize, Solana, SOL, SPL, Cross-Chain, Trading, Fastest, Fast, SerumBTC, SerumUSD, SRM Tokens, SPL Tokens',
    twitter: '@mangomarkets',
    ogImage: 'https://token.mango.markets/preview.jpg',
  },
  {
    symbol: 'MNGO-DEV',
    endpoint: 'devnet',
    mainnetName: 'Mango',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('H2iny4dUP2ngt9p4niUWVX4TKvr1h9eSWGNdP1zvwzNQ'),
    website: 'https://mango.markets',
  },
  {
    symbol: 'SOCEAN',
    endpoint: 'mainnet',
    programId: new PublicKey('5hAykmD4YGcQ7Am3N7nC9kyELq6CThAkU82nhNKDJiCy'),
    realmId: new PublicKey('759qyfKDMMuo9v36tW7fbGanL63mZFPNbhU7zjPrkuGK'),
    website: 'https://www.socean.fi',
  },
  {
    symbol: 'SOCEAN-DEV',
    endpoint: 'devnet',
    mainnetName: 'SOCEAN',
    programId: new PublicKey('GSCN8n6XUGqPqoeubY5GM6e3JgtXbzTcpCUREQ1dVXFG'),
    realmId: new PublicKey('4Z6bAwcBkDg8We6rRdnqK9rjsJz3aMqXAZkpoBZ3hxus'),
    website: 'https://www.socean.fi',
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
    councilMint,
    governances,
    proposals,
    proposalDescriptions,
    tokenRecords,
    councilTokenOwnerRecords,
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

  const councilTokenAccount = useMemo(
    () =>
      realm &&
      councilMint &&
      tokenAccounts.find((a) =>
        a.account.mint.equals(realm.info.config.councilMint)
      ),
    [realm, tokenAccounts]
  )

  const ownCouncilTokenRecord = useMemo(
    () =>
      wallet?.connected &&
      councilMint &&
      councilTokenOwnerRecords[wallet.publicKey.toBase58()],
    [tokenRecords, wallet, connected]
  )

  return {
    realm,
    realmInfo,
    symbol,
    mint,
    councilMint,
    governances,
    proposals,
    proposalDescriptions,
    tokenRecords,
    realmTokenAccount,
    ownTokenRecord,
    councilTokenAccount,
    ownCouncilTokenRecord,
  }
}
