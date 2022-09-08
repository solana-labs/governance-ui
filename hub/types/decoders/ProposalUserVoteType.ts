import * as IT from 'io-ts';

import { ProposalUserVoteType as _ProposalUserVoteType } from '../ProposalUserVoteType';

export const ProposalUserVoteTypeAbstain = IT.literal(
  _ProposalUserVoteType.Abstain,
);
export const ProposalUserVoteTypeNo = IT.literal(_ProposalUserVoteType.No);
export const ProposalUserVoteTypeVeto = IT.literal(_ProposalUserVoteType.Veto);
export const ProposalUserVoteTypeYes = IT.literal(_ProposalUserVoteType.Yes);

export const ProposalUserVoteType = IT.union([
  ProposalUserVoteTypeAbstain,
  ProposalUserVoteTypeNo,
  ProposalUserVoteTypeVeto,
  ProposalUserVoteTypeYes,
]);
