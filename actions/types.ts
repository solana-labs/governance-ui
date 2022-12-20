import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';

export enum VoteTypeKind {
  SingleChoice = 0,
  MultiChoice = 1,
}

export enum GovernanceInstruction {
  CreateRealm = 0,
  DepositGoverningTokens = 1,
  WithdrawGoverningTokens = 2,
  SetGovernanceDelegate = 3,
  CreateGovernance = 4,
  CreateProgramGovernance = 5,
  CreateProposal = 6,
  AddSignatory = 7,
  RemoveSignatory = 8,
  InsertTransaction = 9,
  RemoveTransaction = 10,
  CancelProposal = 11,
  SignOffProposal = 12,
  CastVote = 13,
  FinalizeVote = 14,
  RelinquishVote = 15,
  ExecuteTransaction = 16,
  CreateMintGovernance = 17,
  CreateTokenGovernance = 18,
  SetGovernanceConfig = 19,
  FlagTransactionError = 20,
  SetRealmAuthority = 21,
  SetRealmConfig = 22,
  CreateTokenOwnerRecord = 23,
  UpdateProgramMetadata = 24,
  CreateNativeTreasury = 25,
}

export class RelinquishVoteArgs {
  public instruction: GovernanceInstruction;

  constructor() {
    this.instruction = GovernanceInstruction.RelinquishVote;
  }
}

export class VoteType {
  public type: VoteTypeKind;
  public choiceCount: number | undefined;

  constructor(args: { type: VoteTypeKind; choiceCount: number | undefined }) {
    this.type = args.type;
    this.choiceCount = args.choiceCount;
  }

  public static SINGLE_CHOICE: VoteType = new VoteType({
    type: VoteTypeKind.SingleChoice,
    choiceCount: undefined,
  });

  public static MULTI_CHOICE: (choiceCount: number) => VoteType = (
    choiceCount,
  ) =>
    new VoteType({
      type: VoteTypeKind.MultiChoice,
      choiceCount,
    });

  public isSingleChoice(): boolean {
    return this.type === VoteTypeKind.SingleChoice;
  }
}

export enum YesNoVote {
  Yes = 0,
  No = 1,
}

export class VoteChoice {
  public rank: number;
  public weightPercentage: number;

  constructor(args: { rank: number; weightPercentage: number }) {
    this.rank = args.rank;
    this.weightPercentage = args.weightPercentage;
  }
}

export enum VoteKind {
  Approve = 0,
  Deny = 1,
}

export class Vote {
  public voteType: VoteKind;
  public approveChoices: VoteChoice[] | undefined;
  public deny: boolean | undefined;

  constructor(args: {
    voteType: VoteKind;
    approveChoices: VoteChoice[] | undefined;
    deny: boolean | undefined;
  }) {
    this.voteType = args.voteType;
    this.approveChoices = args.approveChoices;
    this.deny = args.deny;
  }

  public toYesNoVote() {
    switch (this.voteType) {
      case VoteKind.Deny: {
        return YesNoVote.No;
      }
      case VoteKind.Approve: {
        return YesNoVote.Yes;
      }
    }
  }

  public static fromYesNoVote(yesNoVote) {
    switch (yesNoVote) {
      case YesNoVote.Yes: {
        return new Vote({
          voteType: VoteKind.Approve,
          approveChoices: [new VoteChoice({ rank: 0, weightPercentage: 100 })],
          deny: undefined,
        });
      }
      case YesNoVote.No: {
        return new Vote({
          voteType: VoteKind.Deny,
          approveChoices: undefined,
          deny: true,
        });
      }
    }
  }
}

export enum VoteThresholdPercentageType {
  YesVote = 0,
  Quorum = 1,
}

export class VoteThresholdPercentage {
  public type: VoteThresholdPercentageType;
  public value: number;

  constructor(args: { value: number }) {
    this.value = args.value;
  }
}

export enum VoteTipping {
  Strict = 0,
  Early = 1,
  Disabled = 2,
}

export class GovernanceConfig {
  public voteThresholdPercentage: VoteThresholdPercentage;
  public minCommunityTokensToCreateProposal: BN;
  public minInstructionHoldUpTime: number;
  public maxVotingTime: number;
  public voteTipping?: VoteTipping;
  public proposalCoolOffTime?: number;
  public minCouncilTokensToCreateProposal: BN;

  constructor(args: {
    voteThresholdPercentage: VoteThresholdPercentage;
    minCommunityTokensToCreateProposal: BN;
    minInstructionHoldUpTime: number;
    maxVotingTime: number;
    voteTipping?: VoteTipping;
    proposalCoolOffTime?: number;
    minCouncilTokensToCreateProposal: BN;
  }) {
    this.voteThresholdPercentage = args.voteThresholdPercentage;
    this.minCommunityTokensToCreateProposal =
      args.minCommunityTokensToCreateProposal;
    this.minInstructionHoldUpTime = args.minInstructionHoldUpTime;
    this.maxVotingTime = args.maxVotingTime;
    this.voteTipping = args.voteTipping;
    this.proposalCoolOffTime = args.proposalCoolOffTime;
    this.minCouncilTokensToCreateProposal =
      args.minCouncilTokensToCreateProposal;
  }
}

export class TokenOwnerRecord {
  public accountType: GovernanceAccountType;
  public realm: PublicKey;
  public governingTokenMint: PublicKey;
  public governingTokenOwner: PublicKey;
  public governingTokenDepositAmount: BN;
  public unrelinquishedVotesCount: number;
  public totalVotesCount: number;
  public outstandingProposalCount: number;
  public reserved: Uint8Array;
  public governanceDelegate?: PublicKey;

  constructor(args: {
    realm: PublicKey;
    governingTokenMint: PublicKey;
    governingTokenOwner: PublicKey;
    governingTokenDepositAmount: BN;
    unrelinquishedVotesCount: number;
    totalVotesCount: number;
    outstandingProposalCount: number;
    reserved: Uint8Array;
    governanceDelegate: Uint8Array; // PublicKey | undefined;
  }) {
    this.accountType = GovernanceAccountType.TokenOwnerRecordV2;
    this.realm = args.realm;
    this.governingTokenMint = args.governingTokenMint;
    this.governingTokenOwner = args.governingTokenOwner;
    this.governingTokenDepositAmount = args.governingTokenDepositAmount;
    this.unrelinquishedVotesCount = args.unrelinquishedVotesCount;
    this.totalVotesCount = args.totalVotesCount;
    this.outstandingProposalCount = args.outstandingProposalCount;
    this.reserved = args.reserved;

    // governanceDelegate is an option, first 8 byte is if the option is fulfilled or not
    // the rest is the public key
    if (args.governanceDelegate[7] === 1) {
      const buffer = args.governanceDelegate.slice(8);

      this.governanceDelegate = new PublicKey(buffer);
    }
  }
}

export class Governance {
  public accountType: GovernanceAccountType;
  public realm: PublicKey;
  public governedAccount: PublicKey;
  public config: GovernanceConfig;
  public proposalCount: number;
  public reserved?: Uint8Array;
  public votingProposalCount: number;

  constructor(args: {
    realm: PublicKey;
    governedAccount: PublicKey;
    accountType: number;
    config: GovernanceConfig;
    reserved?: Uint8Array;
    proposalCount: number;
    votingProposalCount: number;
  }) {
    this.realm = args.realm;
    this.governedAccount = args.governedAccount;
    this.accountType = args.accountType;
    this.config = args.config;
    this.reserved = args.reserved;
    this.proposalCount = args.proposalCount;
    this.votingProposalCount = args.votingProposalCount;
  }
}

export class SignOffProposalArgs {
  public instruction: GovernanceInstruction;

  constructor() {
    this.instruction = GovernanceInstruction.SignOffProposal;
  }
}

export class AddSignatoryArgs {
  public instruction: GovernanceInstruction;
  public signatory: PublicKey;

  constructor(args: { signatory: PublicKey }) {
    this.instruction = GovernanceInstruction.AddSignatory;
    this.signatory = args.signatory;
  }
}

export class CancelProposalArgs {
  instruction: GovernanceInstruction;

  constructor() {
    this.instruction = GovernanceInstruction.CancelProposal;
  }
}

export class DepositGoverningTokensArgs {
  public instruction: GovernanceInstruction;
  public amount: BN;

  constructor(args: { amount: BN }) {
    this.instruction = GovernanceInstruction.DepositGoverningTokens;
    this.amount = args.amount;
  }
}

export class CastVoteArgs {
  public instruction: GovernanceInstruction;
  public yesNoVote: YesNoVote | undefined;
  public vote: Vote | undefined;

  constructor(args) {
    this.instruction = GovernanceInstruction.CastVote;
    this.yesNoVote = args.yesNoVote;
    this.vote = args.vote;
  }
}

export class CreateProposalArgs {
  public instruction: GovernanceInstruction;
  public name: string;
  public descriptionLink: string;
  public governingTokenMint: PublicKey;
  public voteType: VoteType;
  public options: string[];
  public useDenyOption: boolean;
  public proposalSeed: PublicKey;

  constructor(args: {
    name: string;
    descriptionLink: string;
    governingTokenMint: PublicKey;
    voteType: VoteType;
    options: string[];
    useDenyOption: boolean;
    proposalSeed: PublicKey;
  }) {
    this.instruction = GovernanceInstruction.CreateProposal;
    this.name = args.name;
    this.descriptionLink = args.descriptionLink;
    this.governingTokenMint = args.governingTokenMint;
    this.voteType = args.voteType;
    this.options = args.options;
    this.useDenyOption = args.useDenyOption;
    this.proposalSeed = args.proposalSeed;
  }
}

export enum GovernanceAccountType {
  Uninitialized = 0,
  RealmV1 = 1,
  TokenOwnerRecordV1 = 2,
  GovernanceV1 = 3,
  ProgramGovernanceV1 = 4,
  ProposalV1 = 5,
  SignatoryRecordV1 = 6,
  VoteRecordV1 = 7,
  ProposalInstructionV1 = 8,
  MintGovernanceV1 = 9,
  TokenGovernanceV1 = 10,
  RealmConfig = 11,
  VoteRecordV2 = 12,
  ProposalTransactionV2 = 13,
  ProposalV2 = 14,
  ProgramMetadata = 15,
  RealmV2 = 16,
  TokenOwnerRecordV2 = 17,
  GovernanceV2 = 18,
  ProgramGovernanceV2 = 19,
  MintGovernanceV2 = 20,
  TokenGovernanceV2 = 21,
  SignatoryRecordV2 = 22,
}
