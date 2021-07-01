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
  getTokenAccount,
} from '../utils/tokens'

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet-beta',
    url: 'https://api.mainnet-beta.solana.com/',
    websocket: 'https://api.mainnet-beta.solana.com/',
    programId: '',
    poolKey: '',
  },
  {
    name: 'devnet',
    url: 'https://devnet.solana.com',
    websocket: 'https://devnet.solana.com',
    programId: 'E5s3D6B3PJinuB9kb3dicxfi3qUNLUGX6hoPawhbqagt',
    poolKey: '',
  },
  {
    name: 'localnet',
    url: 'http://localhost:8899',
    websocket: 'http://localhost:8899',
    programId: 'FF8zcQ1aEmyXeBt99hohoyYprgpEVmWsRK44qta3emno',
    poolKey: '8gswb9g1JdYEVj662KXr9p6p9SMgR77NryyqvWn9GPXJ',
  },
]

const CLUSTER = 'localnet'
const ENDPOINT = ENDPOINTS.find((e) => e.name === CLUSTER)
const DEFAULT_CONNECTION = new Connection(ENDPOINT.url, 'recent')
const WEBSOCKET_CONNECTION = new Connection(ENDPOINT.websocket, 'recent')
const PROGRAM_ID = new PublicKey(ENDPOINT.programId)
const POOL_PK = new PublicKey(ENDPOINT.poolKey)

interface PoolAccount {
  distributionAuthority: PublicKey
  endDepositsTs: anchor.BN
  endIdoTs: anchor.BN
  nonce: number
  numIdoTokens: anchor.BN
  poolUsdc: PublicKey
  poolWatermelon: PublicKey
  redeemableMint: PublicKey
  startIdoTs: anchor.BN
  watermelonMint: PublicKey
}

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
  pool: PoolAccount | undefined
  vault: TokenAccount | undefined
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
  pool: undefined,
  vault: undefined,
  actions: {
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

        const pool = (await program.account.poolAccount.fetch(
          POOL_PK
        )) as PoolAccount
        console.log(pool)

        set((state) => {
          state.pool = pool
        })
      }
    },
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
    async fetchVault() {
      const connection = get().connection.current
      const pool = get().pool
      const set = get().set

      if (!pool) return

      const { account: vault } = await getTokenAccount(
        connection,
        pool.poolUsdc
      )
      console.log('fetchVault', vault)

      set((state) => {
        state.vault = vault
      })
    },
    async fetchVaultMint() {
      const connection = get().connection.current
      const vault = get().vault
      const set = get().set

      const { account: mint } = await getMint(connection, vault.mint)
      console.log('fetchVaultMint', mint)

      set((state) => {
        state.mints[vault.mint.toBase58()] = mint
      })
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
