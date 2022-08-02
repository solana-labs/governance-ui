import create, { State } from 'zustand';
import produce from 'immer';
import { PublicKey } from '@solana/web3.js';
import {
  TokenProgramAccount,
  TokenAccount,
  MintAccount,
  tryGetMint,
  getOwnedTokenAccounts,
  parseMintAccountData,
  parseTokenAccountData,
  getMultipleAccountInfoChunked,
} from '../utils/tokens';

import {
  getGovernance,
  getGovernanceAccount,
  getGovernanceAccounts,
  getGovernanceProgramVersion,
  getRealm,
  Governance,
  GovernanceAccountType,
  GOVERNANCE_CHAT_PROGRAM_ID,
  Proposal,
  ProposalState,
  ProposalTransaction,
  Realm,
  SignatoryRecord,
  TokenOwnerRecord,
  VoteRecord,
} from '@solana/spl-governance';
import { ProgramAccount } from '@solana/spl-governance';
import { getGovernanceChatMessages } from '@solana/spl-governance';
import { ChatMessage } from '@solana/spl-governance';
import { GoverningTokenType } from '@solana/spl-governance';
import { AccountInfo, MintInfo } from '@solana/spl-token';
import tokenService from '@utils/services/token';
import { SignerWalletAdapter } from '@solana/wallet-adapter-base';
import { getCertifiedRealmInfo } from '@models/registry/api';
import { tryParsePublicKey } from '@tools/core/pubkey';
import type { ConnectionContext } from 'utils/connection';
import { getConnectionContext } from 'utils/connection';
import { pubkeyFilter } from '@solana/spl-governance';
import {
  getTokenOwnerRecordsForRealmMintMapByOwner,
  getVoteRecordsByProposalMapByVoter,
  getVoteRecordsByVoterMapByProposal,
} from '@models/api';
import { accountsToPubkeyMap } from '@tools/sdk/accounts';
import { HIDDEN_PROPOSALS } from '@components/instructions/tools';
import { BN } from '@project-serum/anchor';

export const EnhancedProposalState = {
  ...ProposalState,

  // Special Enhanced Type
  // Outdated = Suceeded proposal that did not get executed for a long time
  Outdated: 42 as const,
} as const;

export type EnhancedProposalState = ProposalState | 42;

export declare type EnhancedProposal = Omit<Proposal, 'state'> & {
  state: EnhancedProposalState;
};

interface WalletStore extends State {
  connected: boolean;
  connection: ConnectionContext;
  current?: SignerWalletAdapter;

  ownVoteRecordsByProposal: { [proposal: string]: ProgramAccount<VoteRecord> };
  selectedRealm: {
    realm?: ProgramAccount<Realm>;
    mint?: MintAccount;
    programId?: PublicKey;
    councilMint?: MintAccount;
    governances: { [governance: string]: ProgramAccount<Governance> };
    tokenMints: TokenProgramAccount<MintInfo>[];
    tokenAccounts: TokenProgramAccount<TokenAccount>[];
    proposals: { [proposal: string]: ProgramAccount<EnhancedProposal> };
    /// Community token records by owner
    tokenRecords: { [owner: string]: ProgramAccount<TokenOwnerRecord> };
    /// Council token records by owner
    councilTokenOwnerRecords: {
      [owner: string]: ProgramAccount<TokenOwnerRecord>;
    };
    mints: { [pubkey: string]: MintAccount };
    programVersion: number;
    loading: boolean;
  };
  selectedProposal: {
    proposal?: ProgramAccount<EnhancedProposal>;
    governance?: ProgramAccount<Governance>;
    realm?: ProgramAccount<Realm>;
    instructions: {
      [instruction: string]: ProgramAccount<ProposalTransaction>;
    };
    voteRecordsByVoter: { [voter: string]: ProgramAccount<VoteRecord> };
    signatories: { [signatory: string]: ProgramAccount<VoteRecord> };
    chatMessages: { [message: string]: ProgramAccount<ChatMessage> };
    descriptionLink?: string;
    proposalMint?: MintAccount;
    loading: boolean;
    tokenType?: GoverningTokenType;
    proposalOwner?: ProgramAccount<TokenOwnerRecord>;
  };
  providerUrl?: string;
  tokenAccounts: TokenProgramAccount<TokenAccount>[];
  set: (x: any) => void;
  actions: any;
}

const INITIAL_REALM_STATE: WalletStore['selectedRealm'] = {
  governances: {},
  tokenMints: [],
  tokenAccounts: [],
  proposals: {},
  tokenRecords: {},
  councilTokenOwnerRecords: {},
  loading: true,
  mints: {},
  programVersion: 1,
};

const INITIAL_PROPOSAL_STATE: WalletStore['selectedProposal'] = {
  instructions: {},
  voteRecordsByVoter: {},
  signatories: {},
  chatMessages: {},
  loading: true,
};

const TEN_DAYS_IN_MS = 3_600 * 24 * 10 * 1_000;

function isProposalOutdated(
  proposal: ProgramAccount<EnhancedProposal>,
): boolean {
  if (proposal.account.state !== EnhancedProposalState.Succeeded) {
    return false;
  }

  if (!proposal.account.votingCompletedAt) {
    return false;
  }

  if (
    Date.now() -
      proposal.account.votingCompletedAt.mul(new BN(1_000)).toNumber() <=
    TEN_DAYS_IN_MS
  ) {
    return false;
  }

  return true;
}

// Set Outdated flag for proposals that succeeded more than 10 days ago
function setOutdatedStateForProposals(
  proposals: Record<string, ProgramAccount<EnhancedProposal>>,
) {
  Object.values(proposals).forEach((proposal) => {
    if (!isProposalOutdated(proposal)) {
      return;
    }

    proposal.account.state = EnhancedProposalState.Outdated;
  });
}

const useWalletStore = create<WalletStore>((set, get) => ({
  connected: false,
  connection: getConnectionContext('mainnet'),
  ownVoteRecordsByProposal: {},
  selectedRealm: INITIAL_REALM_STATE,
  selectedProposal: INITIAL_PROPOSAL_STATE,
  tokenAccounts: [],
  set: (fn) => set(produce(fn)),

  actions: {
    async fetchRealmBySymbol(cluster: string, symbol: string) {
      const actions = get().actions;
      let connection = get().connection;
      const set = get().set;
      const newConnection = getConnectionContext(cluster);

      // If the cluster is not the same as the one configured in the wallet store, apply a new connection
      if (
        connection.cluster !== newConnection.cluster ||
        connection.endpoint !== newConnection.endpoint
      ) {
        set((s) => {
          s.connection = newConnection;
        });

        connection = get().connection;
      }

      let programId: PublicKey | undefined;
      let realmId = tryParsePublicKey(symbol);

      // If no realmId, get it from the symbol
      if (!realmId) {
        const realmInfo = getCertifiedRealmInfo(symbol, newConnection);
        realmId = realmInfo?.realmId;
        programId = realmInfo?.programId;
      } else {
        try {
          const realmAccountInfo = await connection.current.getAccountInfo(
            realmId,
          );

          programId = realmAccountInfo?.owner;
        } catch {
          //
        }
      }

      if (realmId && programId) {
        const programVersion = await getGovernanceProgramVersion(
          connection.current,
          programId!,
        );

        set((s) => {
          s.selectedRealm.programVersion = programVersion;
        });

        actions.fetchRealm(programId, realmId);
      }
    },
    async fetchWalletTokenAccounts() {
      const connection = get().connection.current;
      const connected = get().connected;
      const wallet = get().current;
      const walletOwner = wallet?.publicKey;
      const set = get().set;

      if (connected && walletOwner) {
        const ownedTokenAccounts = await getOwnedTokenAccounts(
          connection,
          walletOwner,
        );

        set((state) => {
          state.tokenAccounts = ownedTokenAccounts;
        });

        return;
      }

      set((state) => {
        state.tokenAccounts = [];
      });
    },
    async fetchOwnVoteRecords() {
      const connection = get().connection.current;
      const connected = get().connected;
      const programId = get().selectedRealm.programId;
      const wallet = get().current;
      const walletOwner = wallet?.publicKey;
      const set = get().set;

      if (connected && walletOwner && programId) {
        const ownVoteRecordsByProposal = await getVoteRecordsByVoterMapByProposal(
          connection,
          programId,
          walletOwner,
        );

        set((state) => {
          state.ownVoteRecordsByProposal = ownVoteRecordsByProposal;
        });

        return;
      }

      set((state) => {
        state.ownVoteRecordsByProposal = [];
      });
    },
    async fetchRealm(programId: PublicKey, realmId: PublicKey) {
      const set = get().set;
      const connection = get().connection.current;

      console.log('Fetch Realm');

      const realm = await getRealm(connection, realmId);

      const mintsArray = (
        await Promise.all([
          realm?.account.communityMint
            ? tryGetMint(connection, realm.account.communityMint)
            : undefined,
          realm?.account.config?.councilMint
            ? tryGetMint(connection, realm.account.config.councilMint)
            : undefined,
        ])
      ).filter(Boolean);

      set((s) => {
        s.selectedRealm.mints = Object.fromEntries(
          mintsArray.map((m) => [m!.publicKey.toBase58(), m!.account]),
        );
      });

      const realmMints = get().selectedRealm.mints;
      const realmMintPk = realm.account.communityMint;
      const realmMint = realmMints[realmMintPk.toBase58()];
      const realmCouncilMintPk = realm.account.config.councilMint;
      const realmCouncilMint =
        realmCouncilMintPk && realmMints[realmCouncilMintPk.toBase58()];

      const [
        governances,
        tokenRecords,
        councilTokenOwnerRecords,
      ] = await Promise.all([
        getGovernanceAccounts(connection, programId, Governance, [
          pubkeyFilter(1, realmId)!,
        ]),

        getTokenOwnerRecordsForRealmMintMapByOwner(
          connection,
          programId,
          realmId,
          realmMintPk,
        ),

        getTokenOwnerRecordsForRealmMintMapByOwner(
          connection,
          programId,
          realmId,
          realmCouncilMintPk,
        ),
      ]);

      const governancesMap = accountsToPubkeyMap(governances);

      set((s) => {
        s.selectedRealm.realm = realm;
        s.selectedRealm.mint = realmMint;
        s.selectedRealm.programId = programId;
        s.selectedRealm.councilMint = realmCouncilMint;
        s.selectedRealm.governances = governancesMap;
        s.selectedRealm.tokenRecords = tokenRecords;
        s.selectedRealm.councilTokenOwnerRecords = councilTokenOwnerRecords;
      });

      get().actions.fetchOwnVoteRecords();
      get().actions.fetchTokenAccountAndMintsForSelectedRealmGovernances();

      const proposalsByGovernance = await Promise.all(
        governances.map((g) =>
          getGovernanceAccounts(connection, programId, Proposal, [
            pubkeyFilter(1, g.pubkey)!,
          ]),
        ),
      );

      const proposals = accountsToPubkeyMap(
        proposalsByGovernance
          .flatMap((p) => p)
          .filter((p) => !HIDDEN_PROPOSALS.has(p.pubkey.toBase58())),
      );

      setOutdatedStateForProposals(proposals);

      set((s) => {
        s.selectedRealm.proposals = proposals;
        s.selectedRealm.loading = false;
      });
    },

    // Fetches and updates governance for the selected realm
    async fetchRealmGovernance(governancePk: PublicKey) {
      const connection = get().connection.current;
      const set = get().set;

      const governance = await getGovernance(connection, governancePk);

      set((s) => {
        s.selectedRealm.governances[governancePk.toBase58()] = governance;
      });

      return governance;
    },

    async fetchProposal(proposalPk: string) {
      if (HIDDEN_PROPOSALS.has(proposalPk)) {
        return;
      }

      const connection = get().connection.current;
      const realmMints = get().selectedRealm.mints;
      const set = get().set;

      set((s) => {
        s.selectedProposal = INITIAL_PROPOSAL_STATE;
      });

      const proposalPubKey = new PublicKey(proposalPk);

      const proposal = await getGovernanceAccount<EnhancedProposal>(
        connection,
        proposalPubKey,
        Proposal,
      );

      if (isProposalOutdated(proposal)) {
        proposal.account.state = EnhancedProposalState.Outdated;
      }

      const proposalMint =
        realmMints[proposal.account.governingTokenMint.toBase58()];

      const programId = proposal.owner;

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
          Governance,
        ),

        getGovernanceAccounts(connection, programId, ProposalTransaction, [
          pubkeyFilter(1, proposalPubKey)!,
        ]),

        getVoteRecordsByProposalMapByVoter(
          connection,
          programId,
          proposalPubKey,
        ),

        getGovernanceAccounts(connection, programId, SignatoryRecord, [
          pubkeyFilter(1, proposalPubKey)!,
        ]),

        getGovernanceChatMessages(
          connection,
          GOVERNANCE_CHAT_PROGRAM_ID,
          proposalPubKey,
        ),

        getGovernanceAccount(
          connection,
          proposal.account.tokenOwnerRecord,
          TokenOwnerRecord,
        ),
      ]);

      const realm = await getGovernanceAccount(
        connection,
        governance.account.realm,
        Realm,
      );

      const tokenType = realm.account.communityMint.equals(
        proposal.account.governingTokenMint,
      )
        ? GoverningTokenType.Community
        : GoverningTokenType.Council;

      set((s) => {
        s.selectedProposal.proposal = proposal;
        s.selectedProposal.descriptionLink = proposal.account.descriptionLink;
        s.selectedProposal.governance = governance;
        s.selectedProposal.realm = realm;
        s.selectedProposal.instructions = accountsToPubkeyMap(instructions);
        s.selectedProposal.voteRecordsByVoter = voteRecordsByVoter;
        s.selectedProposal.signatories = accountsToPubkeyMap(signatories);
        s.selectedProposal.chatMessages = accountsToPubkeyMap(chatMessages);
        s.selectedProposal.proposalMint = proposalMint;
        s.selectedProposal.loading = false;
        s.selectedProposal.tokenType = tokenType;
        s.selectedProposal.proposalOwner = proposalOwner;
      });
    },
    async fetchChatMessages(proposalPubKey: PublicKey) {
      const connection = get().connection.current;
      const set = get().set;

      const chatMessages = await getGovernanceChatMessages(
        connection,
        GOVERNANCE_CHAT_PROGRAM_ID,
        proposalPubKey,
      );

      set((s) => {
        s.selectedProposal.chatMessages = chatMessages;
      });
    },
    async fetchTokenAccountAndMintsForSelectedRealmGovernances() {
      const {
        fetchTokenAccountsForSelectedRealmGovernances,
        fetchMintsForTokenAccounts,
      } = get().actions;

      await fetchTokenAccountsForSelectedRealmGovernances();

      fetchMintsForTokenAccounts(get().selectedRealm.tokenAccounts);
    },
    async fetchMintsForTokenAccounts(
      tokenAccounts: TokenProgramAccount<AccountInfo>[],
    ) {
      const set = get().set;
      const connection = get().connection.current;

      const tokenAccountsMintInfo = await getMultipleAccountInfoChunked(
        connection,
        tokenAccounts.map((x) => x.account.mint),
      );

      const tokenMints: TokenProgramAccount<MintInfo>[] = tokenAccountsMintInfo.map(
        (tokenAccountMintInfo, index) => {
          const publicKey = tokenAccounts[index].account.mint;
          if (!tokenAccountMintInfo) {
            throw new Error(
              `Missing tokenAccountMintInfo: ${publicKey.toBase58()}`,
            );
          }
          const data = Buffer.from(tokenAccountMintInfo.data);
          const parsedMintInfo = parseMintAccountData(data) as MintInfo;

          return {
            publicKey,
            account: parsedMintInfo,
          };
        },
      );

      set((s) => {
        s.selectedRealm.tokenMints = tokenMints;
      });
    },
    async fetchTokenAccountsForSelectedRealmGovernances() {
      const set = get().set;
      const selectedRealmGovernances = Object.values(
        get().selectedRealm.governances,
      );
      const connection = get().connection.current;
      const tokenAccounts: TokenProgramAccount<AccountInfo>[] = [];
      const tokenGovernances = selectedRealmGovernances.filter(
        (gov) =>
          gov.account?.accountType ===
            GovernanceAccountType.TokenGovernanceV1 ||
          gov.account?.accountType === GovernanceAccountType.TokenGovernanceV2,
      );
      const tokenAccountsInfo = await getMultipleAccountInfoChunked(
        connection,
        tokenGovernances.map((x) => x.account.governedAccount),
      );
      tokenAccountsInfo.forEach((tokenAccountInfo, index) => {
        const publicKey = tokenGovernances[index].account.governedAccount;
        if (!tokenAccountInfo) {
          throw new Error(`Missing tokenAccountInfo: ${publicKey.toBase58()}`);
        }
        const data = Buffer.from(tokenAccountInfo.data);
        const ProgramAccountInfo = parseTokenAccountData(
          publicKey,
          data,
        ) as AccountInfo;
        tokenAccounts.push({
          publicKey: publicKey,
          account: ProgramAccountInfo,
        });
      });
      const tokenMintAdresses = [
        ...new Set(
          tokenAccounts.map((x) => {
            return x.account.mint.toBase58();
          }),
        ),
      ];
      await tokenService.fetchTokenPrices(tokenMintAdresses);
      set((s) => {
        s.selectedRealm.tokenAccounts = tokenAccounts;
      });
    },
    async fetchVoteRecords(proposal: ProgramAccount<EnhancedProposal>) {
      const connection = get().connection.current;
      const set = get().set;

      const programId = proposal.owner;
      const voteRecordsByVoter = await getVoteRecordsByProposalMapByVoter(
        connection,
        programId,
        proposal.pubkey,
      );

      set((s) => {
        s.selectedProposal.voteRecordsByVoter = voteRecordsByVoter;
      });
    },
  },
}));

export default useWalletStore;
