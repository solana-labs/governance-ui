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
  governances: { [governance: string]: ParsedAccount<Governance> }
  proposals: { [proposal: string]: ParsedAccount<Proposal> }
  realms: { [realm: string]: ParsedAccount<Realm> }
  tokenRecords: { [owner: string]: ParsedAccount<TokenOwnerRecord> }
  votes: { [proposal: string]: { yes: number; no: number } }
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
  tokenRecords: {},
  votes: {},
  providerUrl: DEFAULT_PROVIDER.url,
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

        console.log(
          'fetchWalletTokenAccounts',
          connected,
          ownedTokenAccounts.map((t) => t.publicKey.toBase58())
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
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      const connection = get().connection.current
      const endpoint = get().connection.endpoint

      console.log('fetchRealm', programId.toBase58(), realmId.toBase58())

      const realms = await getGovernanceAccounts<Realm>(
        programId,
        endpoint,
        Realm,
        getAccountTypes(Realm)
      )
      console.log('fetchRealm realms', realms[realmId.toBase58()])

      set((s) => {
        s.realms = Object.assign({}, s.realms, realms)
      })

      const realmMint = await getMint(
        connection,
        realms[realmId.toBase58()].info.communityMint
      )

      console.log('fetchRealm mint', realmMint)

      set(
        (s) =>
          (s.mints = Object.assign(
            {},
            s.mints,
            Object.fromEntries([
              [realmMint.publicKey.toBase58(), realmMint.account],
            ])
          ))
      )

      const tokenRecords = await getGovernanceAccounts<TokenOwnerRecord>(
        programId,
        endpoint,
        TokenOwnerRecord,
        getAccountTypes(TokenOwnerRecord),
        [pubkeyFilter(1, realmId), pubkeyFilter(1 + 32, realmMint.publicKey)]
      )
      const tokenRecordsByOwner = Object.fromEntries(
        Object.entries(tokenRecords).map(([_k, v]) => [
          v.info.governingTokenOwner.toBase58(),
          v,
        ])
      )
      console.log('fetchRealm tokenOwners', tokenRecordsByOwner)

      set((s) => {
        s.tokenRecords = Object.assign({}, s.tokenRecords, tokenRecordsByOwner)
      })

      const governances = await getGovernanceAccounts<Governance>(
        programId,
        endpoint,
        Governance,
        getAccountTypes(Governance),
        [pubkeyFilter(1, realmId)]
      )
      console.log('fetchRealm governances', governances)

      set((s) => {
        s.governances = Object.assign({}, s.governances, governances)
      })

      const governanceIds = Object.keys(governances).map(
        (k) => new PublicKey(k)
      )

      const proposalsByGovernance = await Promise.all(
        governanceIds.map((governanceId) => {
          return getGovernanceAccounts<Proposal>(
            programId,
            endpoint,
            Proposal,
            getAccountTypes(Proposal),
            [pubkeyFilter(1, governanceId)]
          )
        })
      )
      const proposals = Object.assign({}, ...proposalsByGovernance)

      console.log('fetchRealm proposals', proposals)

      set((s) => {
        s.proposals = Object.assign({}, s.proposals, proposals)
      })

      const proposalIds = Object.keys(proposals).map((k) => new PublicKey(k))

      const votesByProposal = await Promise.all(
        proposalIds.map(async (proposalId) => {
          const voteRecords = await getGovernanceAccounts<VoteRecord>(
            programId,
            endpoint,
            VoteRecord,
            getAccountTypes(VoteRecord),
            [pubkeyFilter(1, proposalId)]
          )

          const precision = Math.pow(10, 6)
          const yes =
            Object.values(voteRecords)
              .map((v) => v.info.voteWeight.yes)
              .filter((v) => !!v)
              .reduce((acc, cur) => acc.add(cur), new BN(0))
              .mul(new BN(precision))
              .div(realmMint.account.supply)
              .toNumber() *
            (100 / precision)

          const no =
            Object.values(voteRecords)
              .map((v) => v.info.voteWeight.no)
              .filter((v) => !!v)
              .reduce((acc, cur) => acc.add(cur), new BN(0))
              .mul(new BN(precision))
              .div(realmMint.account.supply)
              .toNumber() *
            (100 / precision)

          return [proposalId.toBase58(), { yes, no }]
        })
      )

      console.log('fetchRealm votes', votesByProposal)

      set((s) => {
        s.votes = Object.assign(
          {},
          s.votes,
          Object.fromEntries(votesByProposal)
        )
      })
    },
  },
  set: (fn) => set(produce(fn)),
}))

export default useWalletStore
