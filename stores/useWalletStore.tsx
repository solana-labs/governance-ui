import create, { State } from 'zustand'
import produce from 'immer'
import { Connection, PublicKey } from '@solana/web3.js'
import { EndpointInfo, WalletAdapter } from '../@types/types'
import {
  ProgramAccount,
  TokenAccount,
  MintAccount,
  getMint,
  getOwnedTokenAccounts,
} from '../utils/tokens'
import { getGovernanceAccounts, pubkeyFilter } from '../models/api'
import {
  getAccountTypes,
  Governance,
  Proposal,
  Realm,
  TokenOwnerRecord,
  VoteRecord,
} from '../models/accounts'
import { DEFAULT_PROVIDER } from '../utils/wallet-adapters'
import { ParsedAccount } from '../models/serialisation'
import { BN } from '@project-serum/anchor'

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

  realms: { [realm: string]: ParsedAccount<Realm> }
  selectedRealm: {
    realm?: ParsedAccount<Realm>
    mint?: MintAccount
    governances: { [governance: string]: ParsedAccount<Governance> }
    proposals: { [proposal: string]: ParsedAccount<Proposal> }
    tokenRecords: { [owner: string]: ParsedAccount<TokenOwnerRecord> }
    votes: { [proposal: string]: { yes: number; no: number } }
  }
  selectedProposal: any
  providerUrl: string
  tokenAccounts: ProgramAccount<TokenAccount>[]
  mints: { [pubkey: string]: MintAccount }
  set: (x: any) => void
  actions: any
}

function mapKeys(xs: any, mapFn: (k: string) => any) {
  return Object.keys(xs).map(mapFn)
}

function mapEntries(xs: any, mapFn: (kv: any[]) => any[]) {
  return Object.fromEntries(Object.entries(xs).map(mapFn))
}

function merge(...os) {
  return Object.assign({}, ...os)
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
  realms: {},
  selectedRealm: {
    realm: null,
    mint: null,
    governances: {},
    proposals: {},
    tokenRecords: {},
    votes: {},
  },
  selectedProposal: {},
  providerUrl: DEFAULT_PROVIDER.url,
  tokenAccounts: [],
  mints: {},
  set: (fn) => set(produce(fn)),
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

        console.log(
          'fetchWalletTokenAccounts',
          connected,
          ownedTokenAccounts.map((t) => t.account.mint.toBase58())
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
    async fetchAllRealms(programId: PublicKey) {
      const connection = get().connection.current
      const endpoint = get().connection.endpoint
      const set = get().set

      const realms = await getGovernanceAccounts<Realm>(
        programId,
        endpoint,
        Realm,
        getAccountTypes(Realm)
      )

      set((s) => {
        s.realms = realms
      })

      const mints = await Promise.all(
        Object.values(realms).map((r) =>
          getMint(connection, r.info.communityMint)
        )
      )

      set((s) => {
        s.mints = Object.fromEntries(
          mints.map((m) => [m.publicKey.toBase58(), m.account])
        )
      })
    },
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      const endpoint = get().connection.endpoint
      const realms = get().realms
      const mints = get().mints
      const realm = realms[realmId.toBase58()]
      const realmMintPk = realm.info.communityMint
      const realmMint = mints[realmMintPk.toBase58()]
      const set = get().set

      console.log('fetchRealm', programId.toBase58(), realmId.toBase58())

      const [governances, tokenRecords] = await Promise.all([
        getGovernanceAccounts<Governance>(
          programId,
          endpoint,
          Governance,
          getAccountTypes(Governance),
          [pubkeyFilter(1, realmId)]
        ),

        getGovernanceAccounts<TokenOwnerRecord>(
          programId,
          endpoint,
          TokenOwnerRecord,
          getAccountTypes(TokenOwnerRecord),
          [pubkeyFilter(1, realmId), pubkeyFilter(1 + 32, realmMintPk)]
        ),
      ])

      const tokenRecordsByOwner = mapEntries(tokenRecords, ([_k, v]) => [
        v.info.governingTokenOwner.toBase58(),
        v,
      ])

      console.log('fetchRealm mint', realmMint)
      console.log('fetchRealm governances', governances)
      console.log('fetchRealm tokenRecords', tokenRecordsByOwner)

      set((s) => {
        s.selectedRealm.realm = realm
        s.selectedRealm.mint = realmMint
        s.selectedRealm.governances = governances
        s.selectedRealm.tokenRecords = tokenRecordsByOwner
      })

      const proposalsByGovernance = await Promise.all(
        mapKeys(governances, (g) => {
          return getGovernanceAccounts<Proposal>(
            programId,
            endpoint,
            Proposal,
            getAccountTypes(Proposal),
            [pubkeyFilter(1, new PublicKey(g))]
          )
        })
      )

      const proposals = merge(...proposalsByGovernance)

      console.log('fetchRealm proposals', proposals)

      set((s) => {
        s.selectedRealm.proposals = proposals
      })

      const votesByProposal = await Promise.all(
        mapKeys(proposals, async (p) => {
          const voteRecords = await getGovernanceAccounts<VoteRecord>(
            programId,
            endpoint,
            VoteRecord,
            getAccountTypes(VoteRecord),
            [pubkeyFilter(1, new PublicKey(p))]
          )

          const precision = Math.pow(10, 6)
          const yes =
            Object.values(voteRecords)
              .map((v) => v.info.voteWeight.yes)
              .filter((v) => !!v)
              .reduce((acc, cur) => acc.add(cur), new BN(0))
              .mul(new BN(precision))
              .div(realmMint.supply)
              .toNumber() *
            (100 / precision)

          const no =
            Object.values(voteRecords)
              .map((v) => v.info.voteWeight.no)
              .filter((v) => !!v)
              .reduce((acc, cur) => acc.add(cur), new BN(0))
              .mul(new BN(precision))
              .div(realmMint.supply)
              .toNumber() *
            (100 / precision)

          return [p, { yes, no }]
        })
      )

      // TODO: cache votes of finished proposals permanently in local storage to avoid recounting

      console.log('fetchRealm votes', votesByProposal)

      set((s) => {
        s.selectedRealm.votes = Object.fromEntries(votesByProposal)
      })
    },
  },
}))

export default useWalletStore
