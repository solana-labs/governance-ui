import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'

const ASSET_URL =
  'https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets'

export const WALLET_PROVIDERS = [
  {
    name: 'Phantom',
    url: 'https://www.phantom.app',
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: new PhantomWalletAdapter(),
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
