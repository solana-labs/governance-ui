import { PublicKey } from '@solana/web3.js'
import { equalsIgnoreCase } from '../../tools/core/strings'
import { EndpointTypes } from '../types'

export interface RealmInfo {
  symbol: string
  endpoint?: string
  programId: PublicKey
  realmId: PublicKey
  website?: string
  // Specifies the realm mainnet name for resource lookups
  // It's required for none mainnet environments when the realm name is different than on mainnet
  displayName?: string
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
    displayName: 'Mango DAO',
    programId: new PublicKey('GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J'),
    realmId: new PublicKey('DPiH3H3c7t47BMxqTxLsuPQpEC6Kne8GA9VXbxpnZxFE'),
    website: 'https://mango.markets',
    keywords:
      'Mango Markets, REALM, Governance, Serum, SRM, Serum DEX, DEFI, Decentralized Finance, Decentralised Finance, Crypto, ERC20, Ethereum, Decentralize, Solana, SOL, SPL, Cross-Chain, Trading, Fastest, Fast, SerumBTC, SerumUSD, SRM Tokens, SPL Tokens',
    twitter: '@mangomarkets',
    ogImage: 'https://trade.mango.markets/assets/icons/logo.svg',
  },

  {
    symbol: 'SOCEAN',
    programId: new PublicKey('5hAykmD4YGcQ7Am3N7nC9kyELq6CThAkU82nhNKDJiCy'),
    realmId: new PublicKey('759qyfKDMMuo9v36tW7fbGanL63mZFPNbhU7zjPrkuGK'),
    website: 'https://www.socean.fi',
    ogImage:
      'https://socean-git-enhancement-orca-price-feed-lieuzhenghong.vercel.app/static/media/socnRound.c466b499.png',
  },
  {
    symbol: 'Governance',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('FMEWULPSGR1BKVJK4K7xTjhG23NfYxeAn2bamYgNoUck'),
  },
  {
    symbol: 'Yield Farming',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('8eUUtRpBCg7sJ5FXfPUMiwSQNqC3FjFLkmS2oFPKoiBi'),
  },
  {
    symbol: 'SCTF1',
    programId: new PublicKey('gSF1T5PdLc2EutzwAyeExvdW27ySDtFp88ri5Aymah6'),
    realmId: new PublicKey('EtZWAeFFRC5k6uesap1F1gkHFimsL2HqttVTNAeN86o8'),
  },
]

// Hardcoded list of devnet realms
const DEVNET_REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    displayName: 'Mango DAO',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('H2iny4dUP2ngt9p4niUWVX4TKvr1h9eSWGNdP1zvwzNQ'),
  },
  {
    symbol: 'SOCEAN',
    programId: new PublicKey('GSCN8n6XUGqPqoeubY5GM6e3JgtXbzTcpCUREQ1dVXFG'),
    realmId: new PublicKey('4Z6bAwcBkDg8We6rRdnqK9rjsJz3aMqXAZkpoBZ3hxus'),
  },
  {
    symbol: 'Governance',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('FMEWULPSGR1BKVJK4K7xTjhG23NfYxeAn2bamYgNoUck'),
  },
]

export function getAllRealmInfos(endpoint: EndpointTypes = 'mainnet') {
  return endpoint === 'mainnet' ? MAINNET_REALMS : DEVNET_REALMS
}

export function getRealmInfo(
  symbol: string,
  endpoint: EndpointTypes = 'mainnet'
) {
  if (!symbol) {
    return undefined
  }
  console.log(endpoint === 'devnet', '@@@@@@@@')
  if (endpoint === 'devnet') {
    let devRealmInfo = getAllRealmInfos('devnet').find((r) =>
      equalsIgnoreCase(r.symbol, symbol)
    )

    if (devRealmInfo) {
      devRealmInfo.endpoint = 'devnet'

      const mainnetRealmInfo = getAllRealmInfos('mainnet').find((r) =>
        equalsIgnoreCase(r.symbol, symbol)
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
