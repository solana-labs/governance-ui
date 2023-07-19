import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom'
import { SolletWalletAdapter } from '@solana/wallet-adapter-sollet'
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare'
import { TorusWalletAdapter } from '@solana/wallet-adapter-torus'
import { GlowWalletAdapter } from '@solana/wallet-adapter-glow'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { ExodusWalletAdapter } from '@solana/wallet-adapter-exodus'
import { WalletConnectWalletAdapter } from '@solana/wallet-adapter-walletconnect'
import {
  createDefaultAddressSelector,
  createDefaultAuthorizationResultCache,
  createDefaultWalletNotFoundHandler,
  SolanaMobileWalletAdapter,
} from '@solana-mobile/wallet-adapter-mobile'
import {
  WalletAdapterNetwork,
  WalletReadyState,
} from '@solana/wallet-adapter-base'

const BACKPACK_PROVIDER = {
  name: 'Backpack',
  url: 'https://www.backpack.app/',
  adapter: new BackpackWalletAdapter(),
}

const EXODUS_PROVIDER = {
  name: 'Exodus',
  url: 'https://www.exodus.com/',
  adapter: new ExodusWalletAdapter(),
}

const GLOW_PROVIDER = {
  name: 'Glow',
  url: 'https://glow.app',
  adapter: new GlowWalletAdapter(),
}

const MOBILE_WALLET_PROVIDER = {
  name: 'Mobile Wallet Adapter',
  url: 'https://solanamobile.com/wallets',
  adapter: new SolanaMobileWalletAdapter({
    addressSelector: createDefaultAddressSelector(),
    appIdentity: {
      icon: '/img/logo-realms.png',
      name: 'Realms',
      uri: 'https://app.realms.today',
    },
    authorizationResultCache: createDefaultAuthorizationResultCache(),
    // FIXME: Find a way to toggle this when the application is set to devnet.
    cluster: 'mainnet-beta',
    onWalletNotFound: createDefaultWalletNotFoundHandler(),
  }),
}

const PHANTOM_PROVIDER = {
  name: 'Phantom',
  url: 'https://phantom.app',
  adapter: new PhantomWalletAdapter(),
}

const SOLFLARE_PROVIDER = {
  name: 'Solflare',
  url: 'https://solflare.com',
  adapter: new SolflareWalletAdapter(),
}

const SOLLET_PROVIDER = {
  name: 'Sollet.io',
  url: 'https://www.sollet.io',
  adapter: new SolletWalletAdapter({ provider: 'https://www.sollet.io' }),
}

const TORUS_PROVIDER = {
  name: 'Torus',
  url: 'https://tor.us',
  adapter: new TorusWalletAdapter(),
}

const WALLET_CONNECT = {
  name: 'Wallet Connect',
  url: 'https://walletconnect.com/',
  adapter: new WalletConnectWalletAdapter({
    // TODO make network dynamic
    network: WalletAdapterNetwork.Mainnet,
    options: {
      projectId: '59618f8645f135f20f975e83f4ef0743',
      metadata: {
        name: 'Realms',
        description:
          'Powered by Solana, Realms is a hub for communities to share ideas, make decisions, and collectively manage treasuries.',
        url: 'https://app.realms.today/img/logo-realms.png',
        icons: ['https://app.realms.today'],
      },
    },
  }),
}

export const WALLET_PROVIDERS = [
  MOBILE_WALLET_PROVIDER,
  PHANTOM_PROVIDER,
  BACKPACK_PROVIDER,
  TORUS_PROVIDER,
  GLOW_PROVIDER,
  SOLFLARE_PROVIDER,
  SOLLET_PROVIDER,
  EXODUS_PROVIDER,
  WALLET_CONNECT,
]

export const DEFAULT_PROVIDER =
  MOBILE_WALLET_PROVIDER.adapter.readyState !== WalletReadyState.Unsupported
    ? MOBILE_WALLET_PROVIDER
    : PHANTOM_PROVIDER
