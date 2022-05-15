import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'

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
    name: 'Torus',
    url: 'https://tor.us',
    icon: `/1-Landing-v2/torus-wallet.svg`,
    adapter: new TorusWalletAdapter(),
  },
  {
    name: 'Glow',
    url: 'https://glow.app/',
    icon: `/1-Landing-v2/glow-wallet.png`,
    adapter: new GlowWalletAdapter(),
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
