import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'

const ASSET_URL =
  'https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets'

export const WALLET_PROVIDERS = [
  {
    name: 'Phantom',
    url: 'https://phantom.app',
    icon: `https://phantom.app/img/logo.png`,
    adapter: new PhantomWalletAdapter(),
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com',
    icon: `https://solflare.com/logo.png`,
    adapter: new SolflareWalletAdapter(),
  },
  {
    name: 'Sollet.io',
    url: 'https://www.sollet.io',
    icon: `${ASSET_URL}/sollet.svg`,
    adapter: new SolletWalletAdapter({ provider: 'https://www.sollet.io' }),
  },
]

export const DEFAULT_PROVIDER = WALLET_PROVIDERS[0]

export const getWalletProviderByUrl = (urlOrNull) =>
  WALLET_PROVIDERS.find(({ url }) => url === urlOrNull) || DEFAULT_PROVIDER
