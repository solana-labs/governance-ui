import create, { State } from 'zustand'
import produce from 'immer'
import { Connection, PublicKey } from '@solana/web3.js'
import { EndpointInfo, WalletAdapter } from '../@types/types'
import { ProgramAccount, TokenAccount, MintAccount } from '../utils/tokens'
import { getGovernanceAccounts } from '../models/api'
import { getAccountTypes, Proposal } from '../models/accounts'
import { DEFAULT_PROVIDER } from '../utils/wallet-adapters'

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet-beta',
    url: 'https://mango.rpcpool.com',
    websocket: 'https://mango.rpcpool.com',
    programId: 'GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J',
  },
]

const CLUSTER = 'mainnet-beta'
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
  proposals: undefined
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
    programId: PROGRAM_ID,
  },
  current: null,
  proposals: undefined,
  providerUrl: DEFAULT_PROVIDER.url,
  tokenAccounts: [],
  mints: {},
  actions: {
    async fetchProposals() {
      const endpoint = get().connection.endpoint
      const programId = get().connection.programId
      const set = get().set

      console.log('fetchProposals', endpoint)

      const proposals = await getGovernanceAccounts(
        programId,
        endpoint,
        Proposal,
        getAccountTypes(Proposal)
      )

      console.log('fetchProposals', proposals)

      set((state) => {
        state.proposals = proposals
      })
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
