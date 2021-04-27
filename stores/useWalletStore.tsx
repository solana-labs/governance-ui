import create, { State } from 'zustand'
import produce from 'immer'
import { Connection } from '@solana/web3.js'

import { EndpointInfo, WalletAdapter } from '../@types/types'
import {
  getOwnedTokenAccounts,
  getMint,
  ProgramAccount,
  TokenAccount,
  MintAccount,
} from '../utils/tokens'

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet-beta',
    url: 'https://solana-api.projectserum.com/',
    websocket: 'https://api.mainnet-beta.solana.com/',
  },
  {
    name: 'devnet',
    url: 'https://devnet.solana.com',
    websocket: 'https://devnet.solana.com',
  },
]

const CLUSTER = 'mainnet-beta'
const ENDPOINT = ENDPOINTS.find((e) => e.name === CLUSTER)
const DEFAULT_CONNECTION = new Connection(ENDPOINT.url, 'recent')
const WEBSOCKET_CONNECTION = new Connection(ENDPOINT.websocket, 'recent')

interface WalletStore extends State {
  connected: boolean
  connection: {
    cluster: string
    current: Connection
    websocket: Connection
    endpoint: string
  }
  current: WalletAdapter | undefined
  providerUrl: string
  tokenAccounts: ProgramAccount<TokenAccount>[]
  mints: { [pubkey: string]: MintAccount }
  set: (x: any) => void
  actions: any
}

const useWalletStore = create<WalletStore>((set, get) => ({
  connected: false,
  connection: {
    cluster: CLUSTER,
    current: DEFAULT_CONNECTION,
    websocket: WEBSOCKET_CONNECTION,
    endpoint: ENDPOINT.url,
  },
  current: null,
  providerUrl: null,
  tokenAccounts: [],
  mints: {},
  actions: {
    async fetchWalletTokenAccounts() {
      const connection = get().connection.current
      const connected = get().connected
      const wallet = get().current
      const walletOwner = wallet?.publicKey
      const set = get().set

      if (connected && walletOwner) {
        const ownedTokenAccounts = await getOwnedTokenAccounts(
          connection,
          walletOwner
        )

        set((state) => {
          state.tokenAccounts = ownedTokenAccounts
        })
      } else {
        set((state) => {
          state.tokenAccounts = []
        })
      }
    },
    async fetchWalletMints() {
      const connection = get().connection.current
      const connected = get().connected
      const tokenAccounts = get().tokenAccounts
      const set = get().set

      if (connected) {
        const fetchMints = tokenAccounts.map((a) =>
          getMint(connection, a.account.mint)
        )
        const mintResults = await Promise.all(fetchMints)

        const newMints: { [pubkey: string]: MintAccount } = {}
        mintResults.forEach(
          (m) => (newMints[m.publicKey.toBase58()] = m.account)
        )

        set((state) => {
          state.mints = newMints
        })
      } else {
        set((state) => {
          state.mints = {}
        })
      }
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
