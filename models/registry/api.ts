import { PublicKey } from '@solana/web3.js'

export interface RealmInfo {
  symbol: string
  endpoint?: string
  programId?: PublicKey
  realmId: PublicKey
  website?: string
  // Specifies the realm mainnet name for resource lookups
  // It's required for none mainnet environments when the realm name is different than on mainnet
  mainnetName?: string
  // Website keywords
  keywords?: string
  // twitter:site meta
  twitter?: string
  // og:image
  ogImage?: string
}

const MAINNET_REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
    realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
    website: 'https://mango.markets',
    keywords:
      'Mango Markets, DAO, Governance, Serum, SRM, Serum DEX, DEFI, Decentralized Finance, Decentralised Finance, Crypto, ERC20, Ethereum, Decentralize, Solana, SOL, SPL, Cross-Chain, Trading, Fastest, Fast, SerumBTC, SerumUSD, SRM Tokens, SPL Tokens',
    twitter: '@mangomarkets',
    ogImage: 'https://token.mango.markets/preview.jpg',
  },

  {
    symbol: 'SOCEAN',
    programId: new PublicKey('5hAykmD4YGcQ7Am3N7nC9kyELq6CThAkU82nhNKDJiCy'),
    realmId: new PublicKey('759qyfKDMMuo9v36tW7fbGanL63mZFPNbhU7zjPrkuGK'),
    website: 'https://www.socean.fi',
  },
]

const DEVNET_REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    mainnetName: 'Mango',
    realmId: new PublicKey('H2iny4dUP2ngt9p4niUWVX4TKvr1h9eSWGNdP1zvwzNQ'),
  },
  {
    symbol: 'SOCEAN',
    programId: new PublicKey('GSCN8n6XUGqPqoeubY5GM6e3JgtXbzTcpCUREQ1dVXFG'),
    realmId: new PublicKey('4Z6bAwcBkDg8We6rRdnqK9rjsJz3aMqXAZkpoBZ3hxus'),
  },
]

export function getAllRealmInfos(endpoint: 'mainnet' | 'devnet' = 'mainnet') {
  return endpoint === 'mainnet' ? MAINNET_REALMS : DEVNET_REALMS
}

export function getRealmInfo(symbol: string) {
  if (!symbol) {
    return undefined
  }

  if (symbol.endsWith('-DEV')) {
    const mainnetSymbol = symbol.replace('-DEV', '')

    let realmInfo = getAllRealmInfos('devnet').find(
      (r) => r.symbol === mainnetSymbol
    )

    if (realmInfo) {
      realmInfo.endpoint = 'devnet'

      if (!realmInfo.programId) {
        realmInfo.programId = new PublicKey(
          'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'
        )
      }

      const mainnetRealmInfo = getAllRealmInfos('mainnet').find(
        (r) => r.symbol === mainnetSymbol
      )

      if (mainnetRealmInfo) {
        realmInfo = { ...mainnetRealmInfo, ...realmInfo }
      }
    }

    return realmInfo
  }

  const realmInfo = getAllRealmInfos().find((r) => r.symbol === symbol)

  if (realmInfo) {
    realmInfo.endpoint = 'mainnet'
  }

  return realmInfo
}
