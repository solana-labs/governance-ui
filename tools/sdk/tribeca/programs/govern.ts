import type { AnchorTypes } from '@saberhq/anchor-contrib';
import type { AccountMeta } from '@solana/web3.js';

import type { UgovernIDL } from '../idls/govern';

export * from '../idls/govern';

export type GovernTypes = AnchorTypes<
  UgovernIDL,
  {
    governor: GovernorData;
    proposal: ProposalData;
    vote: VoteData;
    proposalMeta: ProposalMetaData;
  },
  {
    ProposalInstruction: ProposalInstruction;
    ProposalAccountMeta: AccountMeta;
    GovernanceParameters: GovernanceParameters;
  }
>;

type Accounts = GovernTypes['Accounts'];
export type GovernorData = Accounts['Governor'];
export type ProposalData = Accounts['Proposal'];
export type VoteData = Accounts['Vote'];
export type ProposalMetaData = Accounts['ProposalMeta'] & {
  title: string;
  descriptionLink: string;
};

export type GovernanceParameters = GovernTypes['Defined']['GovernanceParameters'];
export type ProposalInstruction = GovernTypes['Defined']['ProposalInstruction'] & {
  keys: AccountMeta[];
};

export type GovernProgram = GovernTypes['Program'];
