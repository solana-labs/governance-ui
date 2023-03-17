import { Proposal, ProposalState } from '@solana/spl-governance'
import classNames from 'classnames'

import useRealm from '@hooks/useRealm'
import useRealmGovernance from '../hooks/useRealmGovernance'
import assertUnreachable from '@utils/typescript/assertUnreachable'
import { isInCoolOffTime } from './VotePanel/hooks'

export const hasInstructions = (proposal: Proposal) => {
  if (proposal.instructionsCount) {
    return true
  }

  if (proposal.options) {
    for (const option of proposal.options) {
      if (option.instructionsCount) {
        return true
      }
    }
  }

  return false
}

interface OtherState {
  isCreator: boolean
  isSignatory: boolean
  proposal: Proposal
  votingEnded: boolean
  coolOff: boolean
}

function getBorderColor(proposalState: ProposalState, otherState: OtherState) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
    case ProposalState.Vetoed:
      return 'border-transparent'
    case ProposalState.Executing:
      return 'border-[#5DC9EB]'
    case ProposalState.Draft:
      return otherState.isCreator ? 'border-white' : 'border-transparent'
    case ProposalState.SigningOff:
      return otherState.isSignatory ? 'border-[#F5A458]' : 'border-transparent'
    case ProposalState.Succeeded:
      return !hasInstructions(otherState.proposal)
        ? 'border-transparent'
        : 'border-[#5DC9EB]'
    case ProposalState.Voting:
      return otherState.votingEnded ? 'border-[#5DC9EB]' : 'border-[#8EFFDD]'
    default:
      assertUnreachable(proposalState)
  }
}

function getLabel(
  proposalState: ProposalState,
  otherState: Pick<OtherState, 'proposal' | 'votingEnded' | 'coolOff'>
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
      return 'Cancelled'
    case ProposalState.Completed:
      return 'Completed'
    case ProposalState.Defeated:
      return 'Defeated'
    case ProposalState.Draft:
      return 'Draft'
    case ProposalState.Executing:
      return 'Executable'
    case ProposalState.ExecutingWithErrors:
      return 'Executing w/ errors'
    case ProposalState.SigningOff:
      return 'Signing off'
    case ProposalState.Succeeded:
      return !hasInstructions(otherState.proposal) ? 'Completed' : 'Executable'
    case ProposalState.Voting:
      return otherState.votingEnded
        ? otherState.coolOff
          ? 'Cool Off'
          : 'Finalizing'
        : 'Voting'
    case ProposalState.Vetoed:
      return 'Vetoed'
    default:
      assertUnreachable(proposalState)
  }
}

function getOpacity(
  proposalState: ProposalState,
  otherState: Pick<OtherState, 'isCreator' | 'isSignatory' | 'proposal'>
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Completed:
    case ProposalState.Defeated:
    case ProposalState.ExecutingWithErrors:
    case ProposalState.Vetoed:
      return 'opacity-70'
    case ProposalState.Draft:
      return otherState.isCreator ? '' : 'opacity-70'
    case ProposalState.SigningOff:
      return otherState.isSignatory ? '' : 'opacity-70'
    case ProposalState.Succeeded:
      return !hasInstructions(otherState.proposal) ? 'opacity-70' : ''
    case ProposalState.Voting:
    case ProposalState.Executing:
      return ''
    default:
      assertUnreachable(proposalState)
  }
}

function getTextColor(
  proposalState: ProposalState,
  otherState: Pick<OtherState, 'proposal' | 'votingEnded'>
) {
  switch (proposalState) {
    case ProposalState.Cancelled:
    case ProposalState.Draft:
      return 'text-white'
    case ProposalState.Completed:
      return 'text-[#8EFFDD]'
    case ProposalState.Defeated:
    case ProposalState.Vetoed:
    case ProposalState.ExecutingWithErrors:
      return 'text-[#FF7C7C]'
    case ProposalState.Executing:
      return 'text-[#5DC9EB]'
    case ProposalState.SigningOff:
      return 'text-[#F5A458]'
    case ProposalState.Succeeded:
      return !hasInstructions(otherState.proposal)
        ? 'text-[#8EFFDD]'
        : 'text-[#5DC9EB]'
    case ProposalState.Voting:
      return otherState.votingEnded
        ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF] bg-clip-text text-transparent'
        : 'text-[#8EFFDD]'
    default:
      assertUnreachable(proposalState)
  }
}

interface Props {
  className?: string
  proposal: Proposal
}

export default function ProposalStateBadge(props: Props) {
  const { ownTokenRecord, ownCouncilTokenRecord } = useRealm()
  const governance = useRealmGovernance(props.proposal.governance)

  const isCreator =
    ownTokenRecord?.pubkey.equals(props.proposal.tokenOwnerRecord) ||
    ownCouncilTokenRecord?.pubkey.equals(props.proposal.tokenOwnerRecord) ||
    false

  // For now, we're not going to display any special UI if the user is a signatory
  const isSignatory = false

  const votingEnded =
    governance && props.proposal.getTimeToVoteEnd(governance) < 0
  const coolOff = isInCoolOffTime(props.proposal, governance)

  const otherState = {
    isCreator,
    isSignatory,
    votingEnded,
    proposal: props.proposal,
    coolOff,
  }

  return (
    <div
      className={classNames(
        props.className,
        'border',
        'inline-flex',
        'min-w-max',
        'items-center',
        'px-2',
        'py-1',
        'rounded-full',
        'text-xs',
        getBorderColor(props.proposal.state, otherState),
        getOpacity(props.proposal.state, otherState),
        getTextColor(props.proposal.state, otherState)
      )}
    >
      {getLabel(props.proposal.state, otherState)}
    </div>
  )
}
