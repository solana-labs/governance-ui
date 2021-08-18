import create, { State } from 'zustand'
import produce from 'immer'
import { Connection, PublicKey } from '@solana/web3.js'
import { EndpointInfo, WalletAdapter } from '../@types/types'
import { ProgramAccount, TokenAccount, MintAccount } from '../utils/tokens'
import { getGovernanceAccounts, pubkeyFilter } from '../models/api'
import {
  getAccountTypes,
  Governance,
  Proposal,
  Realm,
  VoteRecord,
} from '../models/accounts'
import { DEFAULT_PROVIDER } from '../utils/wallet-adapters'
import { ParsedAccount } from '../models/serialisation'

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet-beta',
    url: 'https://mango.rpcpool.com',
    websocket: 'https://mango.rpcpool.com',
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
  governances: { [pubkey: string]: ParsedAccount<Governance> }
  proposals: { [pubkey: string]: ParsedAccount<Proposal> }
  realms: { [pubkey: string]: ParsedAccount<Realm> }
  votes: { [pubkey: string]: ParsedAccount<VoteRecord> }
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
  governances: {},
  proposals: {},
  realms: {},
  votes: {},
  providerUrl: DEFAULT_PROVIDER.url,
  tokenAccounts: [],
  mints: {},
  actions: {
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      const endpoint = get().connection.endpoint

      console.log('fetchRealm', programId.toBase58(), realmId.toBase58())
      const governances = await getGovernanceAccounts<Governance>(
        programId,
        endpoint,
        Governance,
        getAccountTypes(Governance),
        [pubkeyFilter(1, realmId)]
      )
      console.log('fetchRealm', governances)

      set((s) => {
        s.governances = Object.assign({}, s.governances, governances)
      })

      const governanceIds = Object.keys(governances).map(
        (k) => new PublicKey(k)
      )

      console.log(
        'fetchRealm',
        governanceIds.map((id) => id.toBase58())
      )

      const proposals = await Promise.all(
        governanceIds.map(async (governanceId) => {
          return await getGovernanceAccounts<Proposal>(
            programId,
            endpoint,
            Proposal,
            getAccountTypes(Proposal),
            [pubkeyFilter(1, governanceId)]
          )
        })
      )

      console.log('fetchRealm', proposals)

      set((s) => {
        s.proposals = Object.assign({}, s.proposals, ...proposals)
      })
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
