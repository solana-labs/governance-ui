import Wallet from '@project-serum/sol-wallet-adapter'
import { PhantomWalletAdapter } from './phantom'
import { SolletExtensionAdapter } from './sollet-extension'

const ASSET_URL =
  'https://cdn.jsdelivr.net/gh/solana-labs/oyster@main/assets/wallets'

export const WALLET_PROVIDERS = [
  {
    name: 'Sollet.io',
    url: 'https://www.sollet.io',
    icon: `${ASSET_URL}/sollet.svg`,
    adapter: Wallet,
  },
  {
    name: 'Sollet Extension',
    url: 'https://www.sollet.io/extension',
    icon: `${ASSET_URL}/sollet.svg`,
    adapter: SolletExtensionAdapter as any,
  },
  {
    name: 'Phantom',
    url: 'https://www.phantom.app',
    icon: `https://www.phantom.app/img/logo.png`,
    adapter: PhantomWalletAdapter,
  },
]

export const DEFAULT_PROVIDER = WALLET_PROVIDERS[0]

export const getWalletProviderByUrl = (urlOrNull) =>
  WALLET_PROVIDERS.find(({ url }) => url === urlOrNull) || DEFAULT_PROVIDER
