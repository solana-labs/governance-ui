import { TransactionInstruction } from '@solana/web3.js'
import { deserializeBorsh } from '../utils/borsh'

import { BinaryReader, BinaryWriter } from 'borsh'
import {
  AddSignatoryArgs,
  CancelProposalArgs,
  CastVoteArgs,
  CreateAccountGovernanceArgs,
  CreateMintGovernanceArgs,
  CreateProgramGovernanceArgs,
  CreateProposalArgs,
  CreateRealmArgs,
  CreateTokenGovernanceArgs,
  DepositGoverningTokensArgs,
  ExecuteInstructionArgs,
  FinalizeVoteArgs,
  FlagInstructionErrorArgs,
  InsertInstructionArgs,
  RelinquishVoteArgs,
  RemoveInstructionArgs,
  SetGovernanceConfigArgs,
  SetRealmAuthorityArgs,
  SetRealmConfigArgs,
  SignOffProposalArgs,
  WithdrawGoverningTokensArgs,
} from './instructions'
import {
  AccountMetaData,
  RealmConfigArgs,
  Governance,
  GovernanceConfig,
  InstructionData,
  MintMaxVoteWeightSource,
  Proposal,
  ProposalInstruction,
  Realm,
  RealmConfig,
  SignatoryRecord,
  TokenOwnerRecord,
  VoteRecord,
  RealmConfigAccount,
  VoteThresholdPercentage,
  VoteWeight,
} from './accounts'
import { serialize } from 'borsh'
import { ProgramVersion } from './registry/api'

// Temp. workaround to support u16.
;(BinaryReader.prototype as any).readU16 = function () {
  const reader = (this as unknown) as BinaryReader
  const value = reader.buf.readUInt16LE(reader.offset)
  reader.offset += 2
  return value
}

// Temp. workaround to support u16.
;(BinaryWriter.prototype as any).writeU16 = function (value: number) {
  const reader = (this as unknown) as BinaryWriter
  reader.maybeResize()
  reader.buf.writeUInt16LE(value, reader.length)
  reader.length += 2
}

// Serializes sdk instruction into InstructionData and encodes it as base64 which then can be entered into the UI form
export const serializeInstructionToBase64 = (
  instruction: TransactionInstruction
) => {
  const data = new InstructionData({
    programId: instruction.programId,
    data: instruction.data,
    accounts: instruction.keys.map(
      (k) =>
        new AccountMetaData({
          pubkey: k.pubkey,
          isSigner: k.isSigner,
          isWritable: k.isWritable,
        })
    ),
  })

  return Buffer.from(serialize(GOVERNANCE_SCHEMA, data)).toString('base64')
}

export const GOVERNANCE_SCHEMA = createGovernanceSchema(ProgramVersion.V1)
export const GOVERNANCE_SCHEMA_V2 = createGovernanceSchema(ProgramVersion.V2)

export function getGovernanceSchema(programVersion: ProgramVersion) {
  switch (programVersion) {
    case ProgramVersion.V1:
      return GOVERNANCE_SCHEMA
    default:
      return GOVERNANCE_SCHEMA_V2
  }
}

function createGovernanceSchema(programVersion: ProgramVersion) {
  return new Map<any, any>([
    [
      RealmConfigArgs,
      {
        kind: 'struct',
        fields: [
          ['useCouncilMint', 'u8'],
          ['minCommunityTokensToCreateGovernance', 'u64'],
          ['communityMintMaxVoteWeightSource', MintMaxVoteWeightSource],
          // V1 of the program used restrictive instruction deserialisation which didn't allow additional data
          programVersion > ProgramVersion.V1
            ? ['useCommunityVoterWeightAddin', 'u8']
            : undefined,
        ].filter(Boolean),
      },
    ],
    [
      CreateRealmArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['name', 'string'],
          ['configArgs', RealmConfigArgs],
        ],
      },
    ],
    [
      DepositGoverningTokensArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          // V1 of the program used restrictive instruction deserialisation which didn't allow additional data
          programVersion > ProgramVersion.V1 ? ['amount', 'u64'] : undefined,
        ].filter(Boolean),
      },
    ],
    [
      WithdrawGoverningTokensArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      CreateAccountGovernanceArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['config', GovernanceConfig],
        ],
      },
    ],
    [
      CreateProgramGovernanceArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['config', GovernanceConfig],
          ['transferUpgradeAuthority', 'u8'],
        ],
      },
    ],
    [
      CreateMintGovernanceArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['config', GovernanceConfig],
          ['transferMintAuthority', 'u8'],
        ],
      },
    ],
    [
      CreateTokenGovernanceArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['config', GovernanceConfig],
          ['transferTokenOwner', 'u8'],
        ],
      },
    ],
    [
      SetGovernanceConfigArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['config', GovernanceConfig],
        ],
      },
    ],
    [
      CreateProposalArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['name', 'string'],
          ['descriptionLink', 'string'],
          ['governingTokenMint', 'pubkey'],
        ],
      },
    ],
    [
      AddSignatoryArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['signatory', 'pubkey'],
        ],
      },
    ],
    [
      SignOffProposalArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      CancelProposalArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      RelinquishVoteArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      FinalizeVoteArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      CastVoteArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['vote', 'u8'],
        ],
      },
    ],
    [
      InsertInstructionArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['index', 'u16'],
          ['holdUpTime', 'u32'],
          ['instructionData', InstructionData],
        ],
      },
    ],
    [
      RemoveInstructionArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      ExecuteInstructionArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      FlagInstructionErrorArgs,
      {
        kind: 'struct',
        fields: [['instruction', 'u8']],
      },
    ],
    [
      SetRealmAuthorityArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['newRealmAuthority', { kind: 'option', type: 'pubkey' }],
        ],
      },
    ],
    [
      SetRealmConfigArgs,
      {
        kind: 'struct',
        fields: [
          ['instruction', 'u8'],
          ['configArgs', RealmConfigArgs],
        ],
      },
    ],
    [
      InstructionData,
      {
        kind: 'struct',
        fields: [
          ['programId', 'pubkey'],
          ['accounts', [AccountMetaData]],
          ['data', ['u8']],
        ],
      },
    ],
    [
      AccountMetaData,
      {
        kind: 'struct',
        fields: [
          ['pubkey', 'pubkey'],
          ['isSigner', 'u8'],
          ['isWritable', 'u8'],
        ],
      },
    ],

    [
      MintMaxVoteWeightSource,
      {
        kind: 'struct',
        fields: [
          ['type', 'u8'],
          ['value', 'u64'],
        ],
      },
    ],

    [
      RealmConfig,
      {
        kind: 'struct',
        fields: [
          ['useCommunityVoterWeightAddin', 'u8'],
          ['reserved', [7]],
          ['minCommunityTokensToCreateGovernance', 'u64'],
          ['communityMintMaxVoteWeightSource', MintMaxVoteWeightSource],
          ['councilMint', { kind: 'option', type: 'pubkey' }],
        ],
      },
    ],
    [
      Realm,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['communityMint', 'pubkey'],
          ['config', RealmConfig],
          ['reserved', [8]],
          ['authority', { kind: 'option', type: 'pubkey' }],
          ['name', 'string'],
        ],
      },
    ],
    [
      RealmConfigAccount,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['realm', 'pubkey'],
          ['communityVoterWeightAddin', { kind: 'option', type: 'pubkey' }],
        ],
      },
    ],
    [
      Governance,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['realm', 'pubkey'],
          ['governedAccount', 'pubkey'],
          ['proposalCount', 'u32'],
          ['config', GovernanceConfig],
          ['reserved', [8]],
        ],
      },
    ],
    [
      VoteThresholdPercentage,
      {
        kind: 'struct',
        fields: [
          ['type', 'u8'],
          ['value', 'u8'],
        ],
      },
    ],
    [
      GovernanceConfig,
      {
        kind: 'struct',
        fields: [
          ['voteThresholdPercentage', VoteThresholdPercentage],
          ['minCommunityTokensToCreateProposal', 'u64'],
          ['minInstructionHoldUpTime', 'u32'],
          ['maxVotingTime', 'u32'],
          ['voteWeightSource', 'u8'],
          ['proposalCoolOffTime', 'u32'],
          ['minCouncilTokensToCreateProposal', 'u64'],
        ],
      },
    ],
    [
      TokenOwnerRecord,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['realm', 'pubkey'],
          ['governingTokenMint', 'pubkey'],
          ['governingTokenOwner', 'pubkey'],
          ['governingTokenDepositAmount', 'u64'],
          ['unrelinquishedVotesCount', 'u32'],
          ['totalVotesCount', 'u32'],
          ['outstandingProposalCount', 'u8'],
          ['reserved', [7]],
          ['governanceDelegate', { kind: 'option', type: 'pubkey' }],
        ],
      },
    ],
    [
      Proposal,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['governance', 'pubkey'],
          ['governingTokenMint', 'pubkey'],
          ['state', 'u8'],
          ['tokenOwnerRecord', 'pubkey'],
          ['signatoriesCount', 'u8'],
          ['signatoriesSignedOffCount', 'u8'],
          ['yesVotesCount', 'u64'],
          ['noVotesCount', 'u64'],
          ['instructionsExecutedCount', 'u16'],
          ['instructionsCount', 'u16'],
          ['instructionsNextIndex', 'u16'],
          ['draftAt', 'u64'],
          ['signingOffAt', { kind: 'option', type: 'u64' }],
          ['votingAt', { kind: 'option', type: 'u64' }],
          ['votingAtSlot', { kind: 'option', type: 'u64' }],
          ['votingCompletedAt', { kind: 'option', type: 'u64' }],
          ['executingAt', { kind: 'option', type: 'u64' }],
          ['closedAt', { kind: 'option', type: 'u64' }],
          ['executionFlags', 'u8'],
          ['maxVoteWeight', { kind: 'option', type: 'u64' }],
          [
            'voteThresholdPercentage',
            { kind: 'option', type: VoteThresholdPercentage },
          ],
          ['name', 'string'],
          ['descriptionLink', 'string'],
        ],
      },
    ],
    [
      SignatoryRecord,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['proposal', 'pubkey'],
          ['signatory', 'pubkey'],
          ['signedOff', 'u8'],
        ],
      },
    ],
    [
      VoteWeight,
      {
        kind: 'enum',
        values: [
          ['yes', 'u64'],
          ['no', 'u64'],
        ],
      },
    ],
    [
      VoteRecord,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['proposal', 'pubkey'],
          ['governingTokenOwner', 'pubkey'],
          ['isRelinquished', 'u8'],
          ['voteWeight', VoteWeight],
        ],
      },
    ],
    [
      ProposalInstruction,
      {
        kind: 'struct',
        fields: [
          ['accountType', 'u8'],
          ['proposal', 'pubkey'],
          ['instructionIndex', 'u16'],
          ['holdUpTime', 'u32'],
          ['instruction', InstructionData],
          ['executedAt', { kind: 'option', type: 'u64' }],
          ['executionStatus', 'u8'],
        ],
      },
    ],
  ])
}

export function getInstructionDataFromBase64(instructionDataBase64: string) {
  const instructionDataBin = Buffer.from(instructionDataBase64, 'base64')
  const instructionData: InstructionData = deserializeBorsh(
    GOVERNANCE_SCHEMA,
    InstructionData,
    instructionDataBin
  )

  return instructionData
}
