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
    ogImage: '/realms/SCTF1/img/sctf1.svg',
  },
  {
    symbol: 'SERUM',
    programId: new PublicKey('AVoAYTs36yB5izAaBkxRG67wL1AMwG3vo41hKtUSb8is'),
    realmId: new PublicKey('3MMDxjv1SzEFQDKryT7csAvaydYtrgMAc3L9xL9CVLCg'),
    website: 'https://www.projectserum.com/',
    ogImage:
      'https://assets.website-files.com/61284dcff241c2f0729af9f3/61285237ce2e301255d09108_logo-serum.png',
  },
  {
    symbol: 'OMH',
    displayName: 'Off My Head',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('4SsH1eg4zzwfRXBJjrKTY163U2UvW7n16B35pZVPxRpX'),
    ogImage: 'https://offmyhead.vercel.app/coin.png',
    website: 'https://offmyhead.vercel.app',
    twitter: '@nft_omh',
  },
  {
    symbol: 'FRIES',
    displayName: 'Soltato',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('7wsrKBeTpqfcribDo34qr8rdSbqXbmQq9Fog2cVirK6C'),
    ogImage:
      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/FriCEbw1V99GwrJRXPnSQ6su2TabHabNxiZ3VNsVFPPN/logo.png',
    website: 'https://soltato.io',
    twitter: '@Soltato_NFT',
  },
  {
    symbol: 'Metaplex Foundation',
    displayName: 'Metaplex Foundation',
    programId: new PublicKey('GmtpXy362L8cZfkRmTZMYunWVe8TyRjX5B7sodPZ63LJ'),
    realmId: new PublicKey('2sEcHwzsNBwNoTM1yAXjtF1HTMQKUAXf8ivtdpSpo9Fv'),
    ogImage: '/realms/metaplex/img/meta-white.png',
    website: 'https://metaplex.com',
    twitter: '@metaplex',
  },
  {
    symbol: 'Metaplex Genesis',
    displayName: 'Metaplex Genesis',
    programId: new PublicKey('GMpXgTSJt2nJ7zjD1RwbT2QyPhKqD2MjAZuEaLsfPYLF'),
    realmId: new PublicKey('Cdui9Va8XnKVng3VGZXcfBFF6XSxbqSi2XruMc7iu817'),
    ogImage: '/realms/metaplex/img/meta-white.png',
    website: 'https://metaplex.com',
    twitter: '@metaplex',
  },
  {
    symbol: '21DAO',
    displayName: '21DAO',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('Dn5yLFi6ZNhkD25CX4c8qq1MV3CC2vcrH2Qujfzy22rT'),
    ogImage: '/realms/21DAO/img/21dao_icon.png',
    website: 'https://21dao.xyz',
  },
  {
    symbol: 'PART',
    displayName: 'Pegasus Art',
    programId: new PublicKey('bqTjmeob6XTdfh12px2fZq4aJMpfSY1R1nHZ44VgVZD'),
    realmId: new PublicKey('8o1tcKzRsEFAWYzi7Ge2cyotCaQW6vt5f2dy2HkWmemg'),
    ogImage: 'https://app.pegasusdao.com/assets/logo.png',
    website: 'https://www.pegasusdao.com/',
  },
  {
    symbol: 'gSAIL',
    displayName: 'GSAIL GOVERNANCE DAO ',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('36fZRsuM3oXvb5VrEXXVmokbGnjADzVgKpW1pgQq7jXJ'),
    ogImage:
      'https://raw.githubusercontent.com/solanasail/token-list/main/assets/mainnet/Gsai2KN28MTGcSZ1gKYFswUpFpS7EM9mvdR9c8f6iVXJ/logo.png',
    website: 'https://www.solanasail.com/',
    twitter: '@SolanaSail',
  },
]

// Hardcoded list of devnet realms
const DEVNET_REALMS: RealmInfo[] = [
  {
    symbol: 'MNGO',
    displayName: 'Mango DAO',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('H2iny4dUP2ngt9p4niUWVX4TKvr1h9eSWGNdP1zvwzNQ'),
    website: 'https://mango.markets',
    twitter: '@mangomarkets',
    ogImage: 'https://trade.mango.markets/assets/icons/logo.svg',
  },
  {
    symbol: 'SOCEAN',
    programId: new PublicKey('GSCN8n6XUGqPqoeubY5GM6e3JgtXbzTcpCUREQ1dVXFG'),
    realmId: new PublicKey('4Z6bAwcBkDg8We6rRdnqK9rjsJz3aMqXAZkpoBZ3hxus'),
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
    symbol: 'Hype-realm',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('Ap2qT88wk4CPENAcdZN6Q356mauZym4yrQptGXD2AqVF'),
  },
  {
    symbol: 'Realm-8TitF',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('22XYhMSGmPv2nHC3AwbDAP9akyd3rfVRUZt6HUd3wcY5'),
  },
  {
    symbol: 'OMH',
    displayName: 'Off My Head',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('4SsH1eg4zzwfRXBJjrKTY163U2UvW7n16B35pZVPxRpX'),
    ogImage: 'https://offmyhead.vercel.app/coin.png',
    website: 'https://offmyhead.vercel.app',
    twitter: '@nft_omh',
  },
  {
    symbol: 'NEWDAO',
    displayName: 'NEWDAO',
    programId: new PublicKey('GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw'),
    realmId: new PublicKey('5eZA8mX9pVXzgbA8oES1ismVSAAgsHkEipJbxvsVYb5d'),
  },
  {
    symbol: 'PART',
    displayName: 'Pegasus Art',
    programId: new PublicKey('bqTjmeob6XTdfh12px2fZq4aJMpfSY1R1nHZ44VgVZD'),
    realmId: new PublicKey('8o1tcKzRsEFAWYzi7Ge2cyotCaQW6vt5f2dy2HkWmemg'),
    ogImage: 'https://app.pegasusdao.com/assets/logo.png',
    website: 'https://www.pegasusdao.com/',
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

  if (endpoint === 'devnet') {
    let devRealmInfo = getAllRealmInfos('devnet').find((r) => {
      return equalsIgnoreCase(r.symbol, symbol)
    })

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
