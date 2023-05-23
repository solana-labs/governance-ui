import create, { State } from 'zustand'
import produce from 'immer'

import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { getConnectionContext } from 'utils/connection'

interface WalletStore extends State {
  //connection: ConnectionContext
  current: SignerWalletAdapter | undefined
  mockWallet: SignerWalletAdapter | undefined

  //realms: { [realm: string]: ProgramAccount<Realm> }
  /* 
  selectedRealm: {
    //config?: ProgramAccount<RealmConfigAccount>
    //mint?: MintAccount
    //programId?: PublicKey
    //councilMint?: MintAccount
    //governances: { [governance: string]: ProgramAccount<Governance> }
    //proposals: { [proposal: string]: ProgramAccount<Proposal> }
     /// Community token records by owner
    //tokenRecords: { [owner: string]: ProgramAccount<TokenOwnerRecord> }
    /// Council token records by owner
    councilTokenOwnerRecords: {
      [owner: string]: ProgramAccount<TokenOwnerRecord>
    } 
    //mints: { [pubkey: string]: MintAccount }
    // programVersion: number
  } */
  /* 
  selectedProposal: {
    //proposal: ProgramAccount<Proposal> | undefined
    //governance: ProgramAccount<Governance> | undefined
    //realm: ProgramAccount<Realm> | undefined
    //instructions: { [instruction: string]: ProgramAccount<ProposalTransaction> }
    //voteRecordsByVoter: { [voter: string]: ProgramAccount<VoteRecord> }
    //signatories: { [signatory: string]: ProgramAccount<VoteRecord> }
    //chatMessages: { [message: string]: ProgramAccount<ChatMessage> }
    //descriptionLink?: string
    //proposalMint?: MintAccount
    //loading: boolean
    //tokenRole?: GoverningTokenRole
    //proposalOwner: ProgramAccount<TokenOwnerRecord> | undefined
  } */

  providerName: string | undefined
  //tokenAccounts: TokenProgramAccount<TokenAccount>[]
  set: (x: any) => void
  //actions: any
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

const useWalletStore = create<WalletStore>((set, _get) => ({
  connection: getConnectionContext('mainnet'),
  current: undefined,
  mockWallet: undefined,
  realms: {},
  selectedRealm: INITIAL_REALM_STATE,
  selectedProposal: INITIAL_PROPOSAL_STATE,
  providerName: undefined,
  tokenAccounts: [],
  switchboardProgram: undefined,
  set: (fn) => set(produce(fn)),
}))
/* 
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
 */
export default useWalletStore
