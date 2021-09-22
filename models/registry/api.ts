import { PublicKey } from '@solana/web3.js'
import {
  endsWithIgnoreCase,
  equalsIgnoreCase,
  replaceIgnoreCase,
} from '../../tools/core/strings'

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

// Hardcoded list of mainnet realms
// TODO: Once governance program clones registry program and governance accounts metadata is on-chain the list should be moved there
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
  {
    symbol: 'Governance',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('FMEWULPSGR1BKVJK4K7xTjhG23NfYxeAn2bamYgNoUck'),
  },
]

// Hardcoded list of devnet realms
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
  {
    symbol: 'Governance',
    realmId: new PublicKey('FMEWULPSGR1BKVJK4K7xTjhG23NfYxeAn2bamYgNoUck'),
  },
]

export function getAllRealmInfos(endpoint: 'mainnet' | 'devnet' = 'mainnet') {
  return endpoint === 'mainnet' ? MAINNET_REALMS : DEVNET_REALMS
}

export function getRealmInfo(symbol: string) {
  if (!symbol) {
    return undefined
  }

  // TODO: replace -dev realm symbol suffix with query param
  if (endsWithIgnoreCase(symbol, '-DEV')) {
    const mainnetSymbol = replaceIgnoreCase(symbol, '-DEV', '')

    let devRealmInfo = getAllRealmInfos('devnet').find((r) =>
      equalsIgnoreCase(r.symbol, mainnetSymbol)
    )

    if (devRealmInfo) {
      devRealmInfo.endpoint = 'devnet'

      if (!devRealmInfo.programId) {
        devRealmInfo.programId = new PublicKey(
          'GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'
        )
      }

      const mainnetRealmInfo = getAllRealmInfos('mainnet').find((r) =>
        equalsIgnoreCase(r.symbol, mainnetSymbol)
      )

      if (mainnetRealmInfo) {
        devRealmInfo = { ...mainnetRealmInfo, ...devRealmInfo }
      }
    }

    return devRealmInfo
  }

  const realmInfo = getAllRealmInfos().find((r) =>
    equalsIgnoreCase(r.symbol, symbol)
  )

  if (realmInfo) {
    realmInfo.endpoint = 'mainnet'
  }

  return realmInfo
}
