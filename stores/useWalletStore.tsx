import create, { State } from 'zustand'
import produce from 'immer'
import { Connection, PublicKey } from '@solana/web3.js'

import { EndpointInfo, WalletAdapter } from '../@types/types'
import { getOwnedTokenAccounts } from '../utils/tokens'

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
  balances: Array<{ account: any; publicKey: PublicKey }>
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
  balances: [],
  actions: {
    async fetchWalletBalances() {
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

        console.log('fetched wallet balances', ownedTokenAccounts)

        set((state) => {
          state.balances = ownedTokenAccounts
        })
      } else {
        set((state) => {
          state.balances = []
        })
      }
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
