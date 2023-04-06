import * as IT from 'io-ts';

import { ProposalState as _ProposalState } from '../ProposalState';

export const ProposalStateCancelled = IT.literal(_ProposalState.Cancelled);
export const ProposalStateCompleted = IT.literal(_ProposalState.Completed);
export const ProposalStateDefeated = IT.literal(_ProposalState.Defeated);
export const ProposalStateDraft = IT.literal(_ProposalState.Draft);
export const ProposalStateExecutable = IT.literal(_ProposalState.Executable);
export const ProposalStateExecutingWithErrors = IT.literal(
  _ProposalState.ExecutingWithErrors,
);
export const ProposalStateFinalizing = IT.literal(_ProposalState.Finalizing);
export const ProposalStateSigningOff = IT.literal(_ProposalState.SigningOff);
export const ProposalStateVoting = IT.literal(_ProposalState.Voting);

export const ProposalState = IT.union([
  ProposalStateCancelled,
  ProposalStateCompleted,
  ProposalStateDefeated,
  ProposalStateDraft,
  ProposalStateExecutable,
  ProposalStateExecutingWithErrors,
  ProposalStateFinalizing,
  ProposalStateSigningOff,
  ProposalStateVoting,
]);
