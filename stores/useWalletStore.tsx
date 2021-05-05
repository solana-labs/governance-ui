import create, { State } from 'zustand'
import produce from 'immer'
import { Connection, PublicKey } from '@solana/web3.js'
import * as anchor from '@project-serum/anchor'

import { EndpointInfo, WalletAdapter } from '../@types/types'

// @ts-ignore
import poolIdl from '../idls/ido_pool'

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
    url: 'https://api.mainnet-beta.solana.com/',
    websocket: 'https://api.mainnet-beta.solana.com/',
    programId: '',
  },
  {
    name: 'devnet',
    url: 'https://devnet.solana.com',
    websocket: 'https://devnet.solana.com',
    programId: 'E5s3D6B3PJinuB9kb3dicxfi3qUNLUGX6hoPawhbqagt',
  },
]

const CLUSTER = 'devnet'
const ENDPOINT = ENDPOINTS.find((e) => e.name === CLUSTER)
const DEFAULT_CONNECTION = new Connection(ENDPOINT.url, 'recent')
const WEBSOCKET_CONNECTION = new Connection(ENDPOINT.websocket, 'recent')
const PROGRAM_ID = new PublicKey(ENDPOINT.programId)

interface WalletStore extends State {
  connected: boolean
  connection: {
    cluster: string
    current: Connection
    websocket: Connection
    endpoint: string
    programId: PublicKey
  }
  current: WalletAdapter | undefined
  providerUrl: string
  tokenAccounts: ProgramAccount<TokenAccount>[]
  mints: { [pubkey: string]: MintAccount }
  pool: anchor.web3.Account | undefined
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
    programId: PROGRAM_ID,
  },
  current: null,
  providerUrl: null,
  tokenAccounts: [],
  mints: {},
  pool: null,
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
    async fetchPool() {
      const connection = get().connection.current
      const connected = get().connected
      const wallet = get().current
      const programId = get().connection.programId

      console.log('fetchPool', connected, poolIdl)
      if (connection && connected) {
        const provider = new anchor.Provider(
          connection,
          wallet,
          anchor.Provider.defaultOptions()
        )
        const program = new anchor.Program(poolIdl, programId, provider)
        console.log(program)
      }
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
