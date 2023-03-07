import create, { State } from 'zustand'
import produce from 'immer'
import { PublicKey } from '@solana/web3.js'
import {
  TokenProgramAccount,
  TokenAccount,
  MintAccount,
  tryGetMint,
  getOwnedTokenAccounts,
} from '../utils/tokens'

import {
  getGovernance,
  getGovernanceAccount,
  getGovernanceAccounts,
  getGovernanceProgramVersion,
  Governance,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  ProposalTransaction,
  Realm,
  RealmConfigAccount,
  SignatoryRecord,
  TokenOwnerRecord,
  VoteRecord,
  VoteThreshold,
  VoteThresholdType,
} from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { getGovernanceChatMessages } from '@solana/spl-governance'
import { ChatMessage } from '@solana/spl-governance'
import { GoverningTokenRole } from '@solana/spl-governance'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { getCertifiedRealmInfo } from '@models/registry/api'
import { tryParsePublicKey } from '@tools/core/pubkey'
import type { ConnectionContext } from 'utils/connection'
import { getConnectionContext } from 'utils/connection'
import { pubkeyFilter } from '@solana/spl-governance'
import {
  getTokenOwnerRecordsForRealmMintMapByOwner,
  getVoteRecordsByProposalMapByVoter,
  getVoteRecordsByVoterMapByProposal,
} from '@models/api'
import { accountsToPubkeyMap } from '@tools/sdk/accounts'
import { HIDDEN_PROPOSALS } from '@components/instructions/tools'
import { getRealmConfigAccountOrDefault } from '@tools/governance/configs'
import { getProposals } from '@utils/GovernanceTools'

interface WalletStore extends State {
  connected: boolean
  connection: ConnectionContext
  current: SignerWalletAdapter | undefined

  ownVoteRecordsByProposal: { [proposal: string]: ProgramAccount<VoteRecord> }
  realms: { [realm: string]: ProgramAccount<Realm> }
  selectedRealm: {
    realm?: ProgramAccount<Realm>
    config?: ProgramAccount<RealmConfigAccount>
    mint?: MintAccount
    programId?: PublicKey
    councilMint?: MintAccount
    governances: { [governance: string]: ProgramAccount<Governance> }
    proposals: { [proposal: string]: ProgramAccount<Proposal> }
    /// Community token records by owner
    tokenRecords: { [owner: string]: ProgramAccount<TokenOwnerRecord> }
    /// Council token records by owner
    councilTokenOwnerRecords: {
      [owner: string]: ProgramAccount<TokenOwnerRecord>
    }
    mints: { [pubkey: string]: MintAccount }
    programVersion: number
  }
  selectedProposal: {
    proposal: ProgramAccount<Proposal> | undefined
    governance: ProgramAccount<Governance> | undefined
    realm: ProgramAccount<Realm> | undefined
    instructions: { [instruction: string]: ProgramAccount<ProposalTransaction> }
    voteRecordsByVoter: { [voter: string]: ProgramAccount<VoteRecord> }
    signatories: { [signatory: string]: ProgramAccount<VoteRecord> }
    chatMessages: { [message: string]: ProgramAccount<ChatMessage> }
    descriptionLink?: string
    proposalMint?: MintAccount
    loading: boolean
    tokenRole?: GoverningTokenRole
    proposalOwner: ProgramAccount<TokenOwnerRecord> | undefined
  }
  providerName: string | undefined
  tokenAccounts: TokenProgramAccount<TokenAccount>[]
  set: (x: any) => void
  actions: any
  selectedCouncilDelegate: string | undefined
  selectedCommunityDelegate: string | undefined
  councilDelegateVoteRecordsByProposal: {
    [proposal: string]: ProgramAccount<VoteRecord>
  }
  communityDelegateVoteRecordsByProposal: {
    [proposal: string]: ProgramAccount<VoteRecord>
  }
}

const INITIAL_REALM_STATE = {
  realm: undefined,
  mint: undefined,
  programId: undefined,
  councilMint: undefined,
  governances: {},
  proposals: {},
  tokenRecords: {},
  councilTokenOwnerRecords: {},
  loading: true,
  mints: {},
  // @askfish: this should probably just be undefined, and leave it up to components how to handle things while loading
  programVersion: 1,
  config: undefined,
} as const

const INITIAL_PROPOSAL_STATE = {
  proposal: undefined,
  governance: undefined,
  realm: undefined,
  instructions: {},
  voteRecordsByVoter: {},
  signatories: {},
  chatMessages: {},
  descriptionLink: undefined,
  proposalMint: undefined,
  loading: true,
  proposalOwner: undefined,
} as const

const useWalletStore = create<WalletStore>((set, get) => ({
  connected: false,
  connection: getConnectionContext('mainnet'),
  current: undefined,
  realms: {},
  ownVoteRecordsByProposal: {},
  selectedRealm: INITIAL_REALM_STATE,
  selectedProposal: INITIAL_PROPOSAL_STATE,
  providerName: undefined,
  tokenAccounts: [],
  switchboardProgram: undefined,
  selectedCouncilDelegate: undefined,
  selectedCommunityDelegate: undefined,
  councilDelegateVoteRecordsByProposal: {},
  communityDelegateVoteRecordsByProposal: {},
  set: (fn) => set(produce(fn)),
  actions: {
    async fetchRealmBySymbol(cluster: string, symbol: string) {
      const actions = get().actions
      let connection = get().connection
      const set = get().set
      const newConnection = getConnectionContext(cluster)
      if (
        connection.cluster !== newConnection.cluster ||
        connection.endpoint !== newConnection.endpoint
      ) {
        set((s) => {
          s.connection = newConnection
        })
        connection = get().connection
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
        const programVersion = await getGovernanceProgramVersion(
          connection.current,
          programId!
        )
        set((s) => {
          s.selectedRealm.programVersion = programVersion
        })
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

        set((state) => {
          state.tokenAccounts = ownedTokenAccounts
        })
      } else {
        set((state) => {
          state.tokenAccounts = []
        })
      }
    },
    async fetchDelegateVoteRecords() {
      const connection = get().connection.current
      const connected = get().connected
      const programId = get().selectedRealm.programId
      const realmId = get().selectedRealm.realm?.pubkey
      const selectedCouncilDelegate = get().selectedCouncilDelegate
      const selectedCommunityDelegate = get().selectedCommunityDelegate

      const set = get().set

      if (connected && selectedCouncilDelegate && programId && realmId) {
        const councilDelegateVoteRecordsByProposal = await getVoteRecordsByVoterMapByProposal(
          connection,
          programId,
          new PublicKey(selectedCouncilDelegate)
        )

        set((state) => {
          state.councilDelegateVoteRecordsByProposal = councilDelegateVoteRecordsByProposal
        })
      } else {
        set((state) => {
          state.councilDelegateVoteRecordsByProposal = []
        })
      }

      if (connected && selectedCommunityDelegate && programId && realmId) {
        const communityDelegateVoteRecordsByProposal = await getVoteRecordsByVoterMapByProposal(
          connection,
          programId,
          new PublicKey(selectedCommunityDelegate)
        )

        set((state) => {
          state.communityDelegateVoteRecordsByProposal = communityDelegateVoteRecordsByProposal
        })
      } else {
        set((state) => {
          state.communityDelegateVoteRecordsByProposal = []
        })
      }
    },

    // selectedCouncilDelegate: string | undefined
    // selectedCommunityDelegate: string | undefined

    async fetchOwnVoteRecords() {
      const connection = get().connection.current
      const connected = get().connected
      const programId = get().selectedRealm.programId
      const realmId = get().selectedRealm.realm?.pubkey
      const realmMintPk = get().selectedRealm.realm?.account.communityMint
      const wallet = get().current
      const walletOwner = wallet?.publicKey
      const set = get().set

      if (connected && walletOwner && programId && realmId) {
        const [ownVoteRecordsByProposal, tokenRecords] = await Promise.all([
          getVoteRecordsByVoterMapByProposal(
            connection,
            programId,
            walletOwner
          ),
          getTokenOwnerRecordsForRealmMintMapByOwner(
            connection,
            programId,
            realmId,
            realmMintPk
          ),
        ])
        set((state) => {
          state.ownVoteRecordsByProposal = ownVoteRecordsByProposal
          state.selectedRealm.tokenRecords = tokenRecords
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

    // TODO: When this happens fetch vote records for selected delegate?
    selectCouncilDelegate(councilDelegate) {
      const set = get().set
      set((s) => {
        s.selectedCouncilDelegate = councilDelegate
      })
    },
    selectCommunityDelegate(communityDelegate) {
      const set = get().set
      set((s) => {
        s.selectedCommunityDelegate = communityDelegate
      })
    },
    async fetchAllRealms(programId: PublicKey) {
      const connection = get().connection.current
      const set = get().set

      const realms = await getGovernanceAccounts(connection, programId, Realm)

      set((s) => {
        s.realms = accountsToPubkeyMap(realms)
      })
    },
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      const set = get().set
      const connection = get().connection.current
      const connectionContext = get().connection
      const realms = get().realms
      const realm = realms[realmId.toBase58()]
      const mintsArray = (
        await Promise.all([
          realm?.account.communityMint
            ? tryGetMint(connection, realm.account.communityMint)
            : undefined,
          realm?.account.config?.councilMint
            ? tryGetMint(connection, realm.account.config.councilMint)
            : undefined,
        ])
      ).filter(Boolean)

      set((s) => {
        s.selectedRealm.mints = Object.fromEntries(
          mintsArray.map((m) => [m!.publicKey.toBase58(), m!.account])
        )
      })

      const realmMints = get().selectedRealm.mints
      const realmMintPk = realm.account.communityMint
      const realmMint = realmMints[realmMintPk.toBase58()]
      const realmCouncilMintPk = realm.account.config.councilMint
      const realmCouncilMint =
        realmCouncilMintPk && realmMints[realmCouncilMintPk.toBase58()]
      const [
        governances,
        tokenRecords,
        councilTokenOwnerRecords,
        config,
      ] = await Promise.all([
        getGovernanceAccounts(connection, programId, Governance, [
          pubkeyFilter(1, realmId)!,
        ]),

        getTokenOwnerRecordsForRealmMintMapByOwner(
          connection,
          programId,
          realmId,
          realmMintPk
        ),

        getTokenOwnerRecordsForRealmMintMapByOwner(
          connection,
          programId,
          realmId,
          realmCouncilMintPk
        ),
        getRealmConfigAccountOrDefault(connection, programId, realmId),
      ])

      //during the upgrade from v2 to v3 some values are undefined
      //we need to ensure the defaults that
      //match the program:
      //10 for depositExemptProposalCount and 0 for votingCoolOffTime
      const governancesToSetDefaultValues = governances
        .filter(
          (x) =>
            x.account.config.councilVoteThreshold.value === 0 &&
            x.account.config.councilVoteThreshold.type ===
              VoteThresholdType.YesVotePercentage
        )
        .map((x) => x.pubkey)

      const governancesWithDefaultValues = governances.map((x) => {
        if (governancesToSetDefaultValues.find((pk) => pk.equals(x.pubkey))) {
          return getGovernanceWithDefaultValues(x)
        } else {
          return x
        }
      })

      const governancesMap = accountsToPubkeyMap(governancesWithDefaultValues)
      set((s) => {
        s.selectedRealm.config = config
        s.selectedRealm.realm = realm
        s.selectedRealm.mint = realmMint
        s.selectedRealm.programId = programId
        s.selectedRealm.councilMint = realmCouncilMint
        s.selectedRealm.governances = governancesMap
        s.selectedRealm.tokenRecords = tokenRecords
        s.selectedRealm.councilTokenOwnerRecords = councilTokenOwnerRecords
      })
      get().actions.fetchOwnVoteRecords()

      const proposalsByGovernance = await getProposals(
        governances.map((x) => x.pubkey),
        connectionContext,
        programId
      )

      const proposals = accountsToPubkeyMap(
        proposalsByGovernance
          .flatMap((p) => p)
          .filter((p) => !HIDDEN_PROPOSALS.has(p.pubkey.toBase58()))
      )

      set((s) => {
        s.selectedRealm.proposals = proposals
        s.selectedRealm.loading = false
      })
    },

    async refetchProposals() {
      console.log('REFETCH PROPOSALS')
      const set = get().set
      const connectionContext = get().connection
      const programId = get().selectedRealm.programId
      const governances = get().selectedRealm.governances
      const proposalsByGovernance = await getProposals(
        Object.keys(governances).map((x) => new PublicKey(x)),
        connectionContext,
        programId!
      )
      const proposals = accountsToPubkeyMap(
        proposalsByGovernance
          .flatMap((p) => p)
          .filter((p) => !HIDDEN_PROPOSALS.has(p.pubkey.toBase58()))
      )

      await set((s) => {
        s.selectedRealm.proposals = proposals
      })
      await get().actions.fetchOwnVoteRecords()
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
      if (HIDDEN_PROPOSALS.has(proposalPk)) {
        return
      }

      const connection = get().connection.current
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
        realmMints[proposal.account.governingTokenMint.toBase58()]

      const programId = proposal.owner

      const [
        governance,
        instructions,
        voteRecordsByVoter,
        signatories,
        chatMessages,
        proposalOwner,
      ] = await Promise.all([
        getGovernanceAccount(
          connection,
          proposal.account.governance,
          Governance
        ),
        getGovernanceAccounts(connection, programId, ProposalTransaction, [
          pubkeyFilter(1, proposalPubKey)!,
        ]),
        getVoteRecordsByProposalMapByVoter(
          connection,
          programId,
          proposalPubKey
        ),
        getGovernanceAccounts(connection, programId, SignatoryRecord, [
          pubkeyFilter(1, proposalPubKey)!,
        ]),
        getGovernanceChatMessages(
          connection,
          GOVERNANCE_CHAT_PROGRAM_ID,
          proposalPubKey
        ),
        getGovernanceAccount(
          connection,
          proposal.account.tokenOwnerRecord,
          TokenOwnerRecord
        ),
      ])

      const realm = await getGovernanceAccount(
        connection,
        governance.account.realm,
        Realm
      )

      const tokenRole = realm.account.communityMint.equals(
        proposal.account.governingTokenMint
      )
        ? GoverningTokenRole.Community
        : GoverningTokenRole.Council

      const isGovernanceInNeedForDefaultValues =
        governance.account.config.councilVoteThreshold.value === 0 &&
        governance.account.config.councilVoteThreshold.type ===
          VoteThresholdType.YesVotePercentage
      const governanceWithDefaultValues = isGovernanceInNeedForDefaultValues
        ? getGovernanceWithDefaultValues(governance)
        : governance
      set((s) => {
        s.selectedProposal.proposal = proposal
        s.selectedProposal.descriptionLink = proposal.account.descriptionLink
        s.selectedProposal.governance = governanceWithDefaultValues
        s.selectedProposal.realm = realm
        s.selectedProposal.instructions = accountsToPubkeyMap(instructions)
        s.selectedProposal.voteRecordsByVoter = voteRecordsByVoter
        s.selectedProposal.signatories = accountsToPubkeyMap(signatories)
        s.selectedProposal.chatMessages = accountsToPubkeyMap(chatMessages)
        s.selectedProposal.proposalMint = proposalMint
        s.selectedProposal.loading = false
        s.selectedProposal.tokenRole = tokenRole
        s.selectedProposal.proposalOwner = proposalOwner
      })
    },
    async fetchChatMessages(proposalPubKey: PublicKey) {
      const connection = get().connection.current
      const set = get().set

      const chatMessages = await getGovernanceChatMessages(
        connection,
        GOVERNANCE_CHAT_PROGRAM_ID,
        proposalPubKey
      )

      set((s) => {
        s.selectedProposal.chatMessages = chatMessages
      })
    },
    async fetchVoteRecords(proposal: ProgramAccount<Proposal>) {
      const connection = get().connection.current
      const set = get().set

      const programId = proposal.owner
      const voteRecordsByVoter = await getVoteRecordsByProposalMapByVoter(
        connection,
        programId,
        proposal.pubkey
      )

      console.log('voteRecords', voteRecordsByVoter)

      set((s) => {
        s.selectedProposal.voteRecordsByVoter = voteRecordsByVoter
      })
    },
  },
}))

const getGovernanceWithDefaultValues = (
  governance: ProgramAccount<Governance>
) => {
  return {
    ...governance,
    account: {
      ...governance.account,
      config: {
        ...governance.account.config,
        votingCoolOffTime: 0,
        depositExemptProposalCount: 10,
        councilVoteThreshold: governance.account.config.communityVoteThreshold,
        councilVetoVoteThreshold:
          governance.account.config.communityVoteThreshold,
        councilVoteTipping: governance.account.config.communityVoteTipping,
        communityVetoVoteThreshold: new VoteThreshold({
          type: VoteThresholdType.Disabled,
        }),
      },
    },
  }
}

export default useWalletStore
