/* eslint-disable @typescript-eslint/no-non-null-assertion */
import create, { State } from 'zustand'
import produce from 'immer'
import { Connection, PublicKey } from '@solana/web3.js'
import { EndpointInfo } from '../@types/types'
import {
  ProgramAccount,
  TokenAccount,
  MintAccount,
  tryGetMint,
  getOwnedTokenAccounts,
  parseMintAccountData,
  parseTokenAccountData,
  getMultipleAccountInfoChunked,
} from '../utils/tokens'
import {
  getGovernance,
  getGovernanceAccount,
  getGovernanceAccounts,
  getTokenOwnerRecordsByTokenOwner,
} from '../models/api'
import {
  getAccountTypes,
  Governance,
  GovernanceAccountType,
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
import { mapFromEntries, mapEntries } from '../tools/core/script'
import { GoverningTokenType } from '../models/enums'
import { AccountInfo, MintInfo } from '@solana/spl-token'
import tokenService from '@utils/services/token'
import { EndpointTypes } from '@models/types'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { getCertifiedRealmInfo } from '@models/registry/api'
import { tryParsePublicKey } from '@tools/core/pubkey'

export interface ConnectionContext {
  cluster: EndpointTypes
  current: Connection
  endpoint: string
}
interface WalletStore extends State {
  connected: boolean
  connection: ConnectionContext
  current: SignerWalletAdapter | undefined

  ownVoteRecordsByProposal: { [proposal: string]: ParsedAccount<VoteRecord> }
  realms: { [realm: string]: ParsedAccount<Realm> }
  selectedRealm: {
    realm?: ParsedAccount<Realm>
    mint?: MintAccount
    programId?: PublicKey
    councilMint?: MintAccount
    governances: { [governance: string]: ParsedAccount<Governance> }
    tokenMints: ProgramAccount<MintInfo>[]
    tokenAccounts: ProgramAccount<TokenAccount>[]
    proposals: { [proposal: string]: ParsedAccount<Proposal> }
    proposalDescriptions: { [proposal: string]: string }
    /// Community token records by owner
    tokenRecords: { [owner: string]: ParsedAccount<TokenOwnerRecord> }
    /// Council token records by owner
    councilTokenOwnerRecords: {
      [owner: string]: ParsedAccount<TokenOwnerRecord>
    }
    mints: { [pubkey: string]: MintAccount }
  }
  selectedProposal: {
    proposal: ParsedAccount<Proposal> | undefined
    governance: ParsedAccount<Governance> | undefined
    realm: ParsedAccount<Realm> | undefined
    instructions: { [instruction: string]: ParsedAccount<ProposalInstruction> }
    voteRecordsByVoter: { [voter: string]: ParsedAccount<VoteRecord> }
    signatories: { [signatory: string]: ParsedAccount<VoteRecord> }
    chatMessages: { [message: string]: ParsedAccount<ChatMessage> }
    description?: string
    proposalMint?: MintAccount
    loading: boolean
    tokenType?: GoverningTokenType
    proposalOwner: ParsedAccount<TokenOwnerRecord> | undefined
  }
  providerUrl: string
  tokenAccounts: ProgramAccount<TokenAccount>[]
  set: (x: any) => void
  actions: any
}

function mapKeys(xs: any, mapFn: (k: string) => any) {
  return Object.keys(xs).map(mapFn)
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

export async function getVoteRecordsByProposal(
  programId: PublicKey,
  endpoint: string,
  voter: PublicKey
) {
  return getGovernanceAccounts<VoteRecord>(
    programId,
    endpoint,
    VoteRecord,
    getAccountTypes(VoteRecord),
    [pubkeyFilter(33, voter)]
  ).then((vrs) =>
    mapFromEntries(vrs, ([_, v]) => [v.info.proposal.toBase58(), v])
  )
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

async function resolveProposalDescription(description: string) {
  try {
    const url = new URL(description)
    return (await fetchGistFile(url.toString())) ?? description
  } catch {
    return description
  }
}

export const ENDPOINTS: EndpointInfo[] = [
  {
    name: 'mainnet',
    url: process.env.MAINNET_RPC || 'https://mango.rpcpool.com',
  },
  {
    name: 'devnet',
    url: process.env.DEVNET_RPC || 'https://mango.devnet.rpcpool.com',
  },
  {
    name: 'localnet',
    url: 'http://127.0.0.1:8899',
  },
]

export function getConnectionContext(cluster: string): ConnectionContext {
  const ENDPOINT = ENDPOINTS.find((e) => e.name === cluster) || ENDPOINTS[0]
  return {
    cluster: ENDPOINT!.name as EndpointTypes,
    current: new Connection(ENDPOINT!.url, 'recent'),
    endpoint: ENDPOINT!.url,
  }
}

const INITIAL_REALM_STATE = {
  realm: undefined,
  mint: undefined,
  programId: undefined,
  councilMint: undefined,
  governances: {},
  tokenMints: [],
  tokenAccounts: [],
  proposals: {},
  proposalDescriptions: {},
  tokenRecords: {},
  councilTokenOwnerRecords: {},
  loading: true,
  mints: {},
}

const INITIAL_PROPOSAL_STATE = {
  proposal: undefined,
  governance: undefined,
  realm: undefined,
  instructions: {},
  voteRecordsByVoter: {},
  signatories: {},
  chatMessages: {},
  description: undefined,
  proposalMint: undefined,
  loading: true,
  proposalOwner: undefined,
}

const useWalletStore = create<WalletStore>((set, get) => ({
  connected: false,
  connection: getConnectionContext('mainnet'),
  current: undefined,
  realms: {},
  ownVoteRecordsByProposal: {},
  selectedRealm: INITIAL_REALM_STATE,
  selectedProposal: INITIAL_PROPOSAL_STATE,
  providerUrl: DEFAULT_PROVIDER.url,
  tokenAccounts: [],
  set: (fn) => set(produce(fn)),
  actions: {
    async fetchRealmBySymbol(cluster: string, symbol: string) {
      console.log('fetchRealmBySymbol', cluster, symbol)

      const actions = get().actions
      const connection = get().connection
      const set = get().set
      const newConnection = getConnectionContext(cluster)
      if (
        connection.cluster !== newConnection.cluster ||
        connection.endpoint !== newConnection.endpoint
      ) {
        set((s) => {
          s.connection = newConnection
        })
      }

      let programId: PublicKey | undefined
      let realmId = tryParsePublicKey(symbol)

      if (!realmId) {
        const realmInfo = await getCertifiedRealmInfo(symbol, newConnection)
        realmId = realmInfo?.realmId
        programId = realmInfo?.programId
      } else {
        const realmAccountInfo = await connection.current.getAccountInfo(
          realmId
        )
        programId = realmAccountInfo?.owner
      }

      if (realmId && programId) {
        await actions.fetchAllRealms(programId)
        actions.fetchRealm(programId, realmId)
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
    async fetchOwnVoteRecords() {
      const endpoint = get().connection.endpoint
      const connected = get().connected
      const programId = get().selectedRealm.programId
      const wallet = get().current
      const walletOwner = wallet?.publicKey
      const set = get().set

      if (connected && walletOwner && programId) {
        const ownVoteRecordsByProposal = await getVoteRecordsByProposal(
          programId,
          endpoint,
          walletOwner
        )

        console.log('fetchOwnVoteRecords', connected, ownVoteRecordsByProposal)

        set((state) => {
          state.ownVoteRecordsByProposal = ownVoteRecordsByProposal
        })
      } else {
        set((state) => {
          state.ownVoteRecordsByProposal = []
        })
      }
    },
    deselectRealm() {
      const set = get().set
      set((s) => {
        s.selectedRealm = INITIAL_REALM_STATE
      })
    },
    async fetchAllRealms(programId: PublicKey) {
      console.log('fetchAllRealms', programId.toBase58())

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

      console.log('fetchAllRealms', get().realms)
    },
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      console.log('fetchRealm', programId.toBase58(), realmId.toBase58())
      const set = get().set
      const connection = get().connection.current
      const endpoint = get().connection.endpoint
      const realms = get().realms
      const realm = realms[realmId.toBase58()]
      const mintsArray = (
        await Promise.all(
          Object.values(realm || {}).flatMap((r) => [
            r.communityMint
              ? tryGetMint(connection, r.communityMint)
              : undefined,
            r.config?.councilMint
              ? tryGetMint(connection, r.config.councilMint)
              : undefined,
          ])
        )
      ).filter(Boolean)

      set((s) => {
        s.selectedRealm.mints = Object.fromEntries(
          mintsArray.map((m) => [m!.publicKey.toBase58(), m!.account])
        )
      })
      const realmMints = get().selectedRealm.mints
      const realmMintPk = realm.info.communityMint
      const realmMint = realmMints[realmMintPk.toBase58()]
      const realmCouncilMintPk = realm.info.config.councilMint
      const realmCouncilMint =
        realmCouncilMintPk && realmMints[realmCouncilMintPk.toBase58()]
      const [
        governances,
        tokenRecords,
        councilTokenOwnerRecords,
      ] = await Promise.all([
        getGovernanceAccounts<Governance>(
          programId,
          endpoint,
          Governance,
          getAccountTypes(Governance),
          [pubkeyFilter(1, realmId)]
        ),

        getTokenOwnerRecordsByTokenOwner(
          programId,
          endpoint,
          realmId,
          realmMintPk
        ),

        getTokenOwnerRecordsByTokenOwner(
          programId,
          endpoint,
          realmId,
          realmCouncilMintPk
        ),
      ])

      console.log('fetchRealm mint', realmMint)
      console.log('fetchRealm councilMint', realmCouncilMint)
      console.log('fetchRealm governances', governances)
      console.log('fetchRealm tokenRecords', {
        tokenRecords,
        councilTokenOwnerRecords,
      })

      set((s) => {
        s.selectedRealm.realm = realm
        s.selectedRealm.mint = realmMint
        s.selectedRealm.programId = programId
        s.selectedRealm.councilMint = realmCouncilMint
        s.selectedRealm.governances = governances
        s.selectedRealm.tokenRecords = tokenRecords
        s.selectedRealm.councilTokenOwnerRecords = councilTokenOwnerRecords
      })
      get().actions.fetchOwnVoteRecords()
      get().actions.fetchTokenAccountAndMintsForSelectedRealmGovernances()
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
          return [k, await resolveProposalDescription(v.info.descriptionLink)]
        }
      )

      console.log('fetchRealm proposalDescriptions', proposalDescriptions)

      set((s) => {
        s.selectedRealm.proposalDescriptions = proposalDescriptions
        s.selectedRealm.loading = false
      })
    },

    // Fetches and updates governance for the selected realm
    async fetchRealmGovernance(governancePk: PublicKey) {
      const connection = get().connection.current
      const set = get().set

      const governance = await getGovernance(connection, governancePk)

      set((s) => {
        s.selectedRealm.governances[governancePk.toBase58()] = governance
      })

      return governance
    },

    async fetchProposal(proposalPk: string) {
      console.log('fetchProposal', proposalPk)

      const connection = get().connection.current
      const endpoint = get().connection.endpoint
      const realmMints = get().selectedRealm.mints
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

      const proposalMint =
        realmMints[proposal.info.governingTokenMint.toBase58()]

      const programId = proposal.account.owner

      const [
        description,
        governance,
        instructions,
        voteRecordsByVoter,
        signatories,
        chatMessages,
        proposalOwner,
      ] = await Promise.all([
        resolveProposalDescription(proposal.info.descriptionLink),
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
        getGovernanceAccount<TokenOwnerRecord>(
          connection,
          proposal.info.tokenOwnerRecord,
          TokenOwnerRecord
        ),
      ])

      const realm = await getGovernanceAccount<Realm>(
        connection,
        governance.info.realm,
        Realm
      )

      const tokenType = realm.info.communityMint.equals(
        proposal.info.governingTokenMint
      )
        ? GoverningTokenType.Community
        : GoverningTokenType.Council

      console.log('fetchProposal fetched', {
        governance,
        proposal,
        realm,
        instructions,
        voteRecordsByVoter,
        signatories,
        chatMessages,
        tokenType,
        proposalOwner,
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
        s.selectedProposal.tokenType = tokenType
        s.selectedProposal.proposalOwner = proposalOwner
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
    async fetchTokenAccountAndMintsForSelectedRealmGovernances() {
      const {
        fetchTokenAccountsForSelectedRealmGovernances,
        fetchMintsForTokenAccounts,
      } = get().actions
      await fetchTokenAccountsForSelectedRealmGovernances()
      fetchMintsForTokenAccounts(get().selectedRealm.tokenAccounts)
    },
    async fetchMintsForTokenAccounts(
      tokenAccounts: ProgramAccount<AccountInfo>[]
    ) {
      const set = get().set
      const connection = get().connection.current
      const tokenMints: ProgramAccount<MintInfo>[] = []
      const tokenAccountsMintInfo = await getMultipleAccountInfoChunked(
        connection,
        tokenAccounts.map((x) => x.account.mint)
      )
      tokenAccountsMintInfo.forEach((tokenAccountMintInfo, index) => {
        const publicKey = tokenAccounts[index].account.mint
        if (!tokenAccountMintInfo) {
          throw new Error(
            `Missing tokenAccountMintInfo: ${publicKey.toBase58()}`
          )
        }
        const data = Buffer.from(tokenAccountMintInfo.data)
        const parsedMintInfo = parseMintAccountData(data) as MintInfo
        tokenMints.push({
          publicKey,
          account: parsedMintInfo,
        })
      })
      set((s) => {
        s.selectedRealm.tokenMints = tokenMints
      })
    },
    async fetchTokenAccountsForSelectedRealmGovernances() {
      const set = get().set
      const selectedRealmGovernances = Object.values(
        get().selectedRealm.governances
      )
      const connection = get().connection.current
      const tokenAccounts: ProgramAccount<AccountInfo>[] = []
      const tokenGovernances = selectedRealmGovernances.filter(
        (gov) => gov.info?.accountType === GovernanceAccountType.TokenGovernance
      )
      const tokenAccountsInfo = await getMultipleAccountInfoChunked(
        connection,
        tokenGovernances.map((x) => x.info.governedAccount)
      )
      tokenAccountsInfo.forEach((tokenAccountInfo, index) => {
        const publicKey = tokenGovernances[index].info.governedAccount
        if (!tokenAccountInfo) {
          throw new Error(`Missing tokenAccountInfo: ${publicKey.toBase58()}`)
        }
        const data = Buffer.from(tokenAccountInfo.data)
        const parsedAccountInfo = parseTokenAccountData(
          publicKey,
          data
        ) as AccountInfo
        tokenAccounts.push({
          publicKey: publicKey,
          account: parsedAccountInfo,
        })
      })
      const tokenMintAdresses = [
        ...new Set(
          tokenAccounts.map((x) => {
            return x.account.mint.toBase58()
          })
        ),
      ]
      await tokenService.fetchTokenPrices(tokenMintAdresses)
      set((s) => {
        s.selectedRealm.tokenAccounts = tokenAccounts
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
