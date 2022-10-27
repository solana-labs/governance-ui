import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'

export const WALLET_PROVIDERS = [
  {
    name: 'Phantom',
    url: 'https://phantom.app',
    adapter: new PhantomWalletAdapter(),
  },
  {
    name: 'Backpack',
    url: 'https://www.backpack.app/',
    adapter: new BackpackWalletAdapter(),
  },
  {
    name: 'Torus',
    url: 'https://tor.us',
    adapter: new TorusWalletAdapter(),
  },
  {
    name: 'Glow',
    url: 'https://glow.app',
    adapter: new GlowWalletAdapter(),
  },
  {
    name: 'Solflare',
    url: 'https://solflare.com',
    adapter: new SolflareWalletAdapter(),
  },
  {
    name: 'Sollet.io',
    url: 'https://www.sollet.io',
    adapter: new SolletWalletAdapter({ provider: 'https://www.sollet.io' }),
  },
  {
    name: 'Exodus',
    url: 'https://www.exodus.com/',
    adapter: new ExodusWalletAdapter(),
  },
]

export const DEFAULT_PROVIDER = WALLET_PROVIDERS[0]

export const getWalletProviderByUrl = (urlOrNull) =>
  WALLET_PROVIDERS.find(({ url }) => url === urlOrNull) || DEFAULT_PROVIDER
