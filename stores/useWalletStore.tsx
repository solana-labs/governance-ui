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
import { getGovernanceAccount, getGovernanceAccounts } from '../models/api'
import {
  getAccountTypes,
  Governance,
  Proposal,
  ProposalInstruction,
  Realm,
  SignatoryRecord,
  TokenOwnerRecord,
  VoteRecord,
} from '../models/accounts'
import { DEFAULT_PROVIDER } from '../utils/wallet-adapters'
import { ParsedAccount } from '../models/core/accounts'
import { fetchGistFile } from '../utils/github'
import { pubkeyFilter } from '../scripts/api'
import { getGovernanceChatMessages } from '../models/chat/api'
import { ChatMessage } from '../models/chat/accounts'

interface WalletStore extends State {
  connected: boolean
  connection: {
    cluster: string
    current: Connection
    endpoint: string
  }
  current: WalletAdapter | undefined

  realms: { [realm: string]: ParsedAccount<Realm> }
  selectedRealm: {
    realm?: ParsedAccount<Realm>
    mint?: MintAccount
    governances: { [governance: string]: ParsedAccount<Governance> }
    proposals: { [proposal: string]: ParsedAccount<Proposal> }
    proposalDescriptions: { [proposal: string]: string }
    tokenRecords: { [owner: string]: ParsedAccount<TokenOwnerRecord> }
  }
  selectedProposal: {
    proposal: ParsedAccount<Proposal>
    governance: ParsedAccount<Governance>
    realm: ParsedAccount<Realm>
    instructions: { [instruction: string]: ParsedAccount<ProposalInstruction> }
    voteRecordsByVoter: { [voter: string]: ParsedAccount<VoteRecord> }
    signatories: { [signatory: string]: ParsedAccount<VoteRecord> }
    chatMessages: { [message: string]: ParsedAccount<ChatMessage> }
    description?: string
    proposalMint?: MintAccount
    loading: boolean
  }
  providerUrl: string
  tokenAccounts: ProgramAccount<TokenAccount>[]
  mints: { [pubkey: string]: MintAccount }
  set: (x: any) => void
  actions: any
}

function mapKeys(xs: any, mapFn: (k: string) => any) {
  return Object.keys(xs).map(mapFn)
}

function mapEntries(xs: any, mapFn: (kv: [string, any]) => any) {
  return Object.entries(xs).map(mapFn)
}

function mapFromEntries(xs: any, mapFn: (kv: [string, any]) => [string, any]) {
  return Object.fromEntries(mapEntries(xs, mapFn))
}

async function mapFromPromisedEntries(
  xs: any,
  mapFn: (kv: [string, any]) => Promise<[string, any]>
) {
  return Object.fromEntries(await Promise.all(mapEntries(xs, mapFn)))
}

function merge(...os) {
  return Object.assign({}, ...os)
}

export async function getVoteRecordsByVoter(
  programId: PublicKey,
  endpoint: string,
  proposalPubKey: PublicKey
) {
  return getGovernanceAccounts<VoteRecord>(
    programId,
    endpoint,
    VoteRecord,
    getAccountTypes(VoteRecord),
    [pubkeyFilter(1, proposalPubKey)]
  ).then((vrs) =>
    mapFromEntries(vrs, ([_, v]) => [v.info.governingTokenOwner.toBase58(), v])
  )
}

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet',
    url: 'https://mango.rpcpool.com',
  },
  {
    name: 'devnet',
    url: 'https://api.devnet.solana.com',
  },
]

const ENDPOINT = ENDPOINTS.find((e) => e.name === 'mainnet')
const INITIAL_CONNECTION_STATE = {
  cluster: ENDPOINT.name,
  current: new Connection(ENDPOINT.url, 'recent'),
  endpoint: ENDPOINT.url,
}

const INITIAL_REALM_STATE = {
  realm: null,
  mint: null,
  governances: {},
  proposals: {},
  proposalDescriptions: {},
  tokenRecords: {},
  loading: true,
}

const INITIAL_PROPOSAL_STATE = {
  proposal: null,
  governance: null,
  realm: null,
  instructions: {},
  voteRecordsByVoter: {},
  signatories: {},
  chatMessages: {},
  description: null,
  proposalMint: null,
  loading: true,
}

const useWalletStore = create<WalletStore>((set, get) => ({
  connected: false,
  connection: INITIAL_CONNECTION_STATE,
  current: null,
  realms: {},
  selectedRealm: INITIAL_REALM_STATE,
  selectedProposal: INITIAL_PROPOSAL_STATE,
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
      console.log('fetchAllRealms', programId.toBase58())

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

      console.log('fetchAllRealms', get().realms, get().mints)
    },
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      console.log('fetchRealm', programId.toBase58(), realmId.toBase58())

      const endpoint = get().connection.endpoint
      const realms = get().realms
      const mints = get().mints
      const realm = realms[realmId.toBase58()]
      const realmMintPk = realm.info.communityMint
      const realmMint = mints[realmMintPk.toBase58()]
      const set = get().set

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

      const tokenRecordsByOwner = mapFromEntries(tokenRecords, ([_k, v]) => [
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
        mapKeys(governances, (g) =>
          getGovernanceAccounts<Proposal>(
            programId,
            endpoint,
            Proposal,
            getAccountTypes(Proposal),
            [pubkeyFilter(1, new PublicKey(g))]
          )
        )
      )

      const proposals: Record<string, ParsedAccount<Proposal>> = merge(
        ...proposalsByGovernance
      )

      console.log('fetchRealm proposals', proposals)

      set((s) => {
        s.selectedRealm.proposals = proposals
      })

      const proposalDescriptions = await mapFromPromisedEntries(
        proposals,
        async ([k, v]: [string, ParsedAccount<Proposal>]) => {
          return [k, await fetchGistFile(v.info.descriptionLink)]
        }
      )

      console.log('fetchRealm proposalDescriptions', proposalDescriptions)

      set((s) => {
        s.selectedRealm.proposalDescriptions = proposalDescriptions
        s.selectedRealm.loading = false
      })
    },

    async fetchProposal(proposalPk: string) {
      console.log('fetchProposal', proposalPk)

      const connection = get().connection.current
      const endpoint = get().connection.endpoint
      const mints = get().mints
      const set = get().set

      set((s) => {
        s.selectedProposal = INITIAL_PROPOSAL_STATE
      })

      const proposalPubKey = new PublicKey(proposalPk)

      const proposal = await getGovernanceAccount<Proposal>(
        connection,
        proposalPubKey,
        Proposal
      )

      const proposalMint = mints[proposal.info.governingTokenMint.toBase58()]

      const programId = proposal.account.owner

      const [
        description,
        governance,
        instructions,
        voteRecordsByVoter,
        signatories,
        chatMessages,
      ] = await Promise.all([
        fetchGistFile(proposal.info.descriptionLink),
        getGovernanceAccount<Governance>(
          connection,
          proposal.info.governance,
          Governance
        ),
        getGovernanceAccounts<ProposalInstruction>(
          programId,
          endpoint,
          ProposalInstruction,
          getAccountTypes(ProposalInstruction),
          [pubkeyFilter(1, proposalPubKey)]
        ),
        getVoteRecordsByVoter(programId, endpoint, proposalPubKey),
        getGovernanceAccounts<SignatoryRecord>(
          programId,
          endpoint,
          SignatoryRecord,
          getAccountTypes(SignatoryRecord),
          [pubkeyFilter(1, proposalPubKey)]
        ),
        getGovernanceChatMessages(endpoint, proposalPubKey),
      ])

      const realm = await getGovernanceAccount<Realm>(
        connection,
        governance.info.realm,
        Realm
      )

      console.log('fetchProposal fetched', {
        governance,
        proposal,
        realm,
        instructions,
        voteRecordsByVoter,
        signatories,
        chatMessages,
      })

      set((s) => {
        s.selectedProposal.proposal = proposal
        s.selectedProposal.description = description
        s.selectedProposal.governance = governance
        s.selectedProposal.realm = realm
        s.selectedProposal.instructions = instructions
        s.selectedProposal.voteRecordsByVoter = voteRecordsByVoter
        s.selectedProposal.signatories = signatories
        s.selectedProposal.chatMessages = chatMessages
        s.selectedProposal.proposalMint = proposalMint
        s.selectedProposal.loading = false
      })
    },
    async fetchChatMessages(proposalPubKey: PublicKey) {
      const endpoint = get().connection.endpoint
      const set = get().set

      const chatMessages = await getGovernanceChatMessages(
        endpoint,
        proposalPubKey
      )

      set((s) => {
        s.selectedProposal.chatMessages = chatMessages
      })
    },

    async fetchVoteRecords(proposal: ParsedAccount<Proposal>) {
      const endpoint = get().connection.endpoint
      const set = get().set

      const programId = proposal.account.owner
      const voteRecordsByVoter = await getVoteRecordsByVoter(
        programId,
        endpoint,
        proposal.pubkey
      )

      set((s) => {
        s.selectedProposal.voteRecordsByVoter = voteRecordsByVoter
      })
    },
  },
}))

export default useWalletStore
