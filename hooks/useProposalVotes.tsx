import { BN } from '@coral-xyz/anchor'
import { Proposal, ProposalState } from '@solana/spl-governance'
import { getProposalMaxVoteWeight } from '../models/voteWeights'
import { calculatePct, fmtTokenAmount } from '../utils/formatting'
import { useMaxVoteRecord } from './useMaxVoteRecord'
import useProgramVersion from './useProgramVersion'
import { useRealmQuery } from './queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from './queries/mintInfo'
import { useGovernanceByPubkeyQuery } from './queries/governance'

// TODO support council plugins
export default function useProposalVotes(proposal?: Proposal) {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result
  const maxVoteRecord = useMaxVoteRecord()
  const governance = useGovernanceByPubkeyQuery(proposal?.governance).data
    ?.result?.account

  const programVersion = useProgramVersion()

  const proposalMint =
    proposal?.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
      ? mint
      : councilMint
  // TODO: optimize using memo
  if (!realm || !proposal || !governance || !proposalMint || !programVersion)
    return {
      _programVersion: undefined,
      voteThresholdPct: undefined,
      yesVotePct: undefined,
      yesVoteProgress: undefined,
      yesVoteCount: undefined,
      noVoteCount: undefined,
      minimumYesVotes: undefined,
      yesVotesRequired: undefined,
      relativeNoVotes: undefined,
      relativeYesVotes: undefined,
    }

  const isCommunityVote =
    proposal?.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
  const isPluginCommunityVoting = maxVoteRecord && isCommunityVote

  const voteThresholdPct = isCommunityVote
    ? governance.config.communityVoteThreshold.value
      ? governance.config.communityVoteThreshold.value
      : 0
    : programVersion > 2
    ? governance.config.councilVoteThreshold.value || 0
    : governance.config.communityVoteThreshold.value || 0

  if (voteThresholdPct === undefined)
    throw new Error(
      'Proposal has no vote threshold (this shouldnt be possible)'
    )

  // note this can be WRONG if the proposal status is vetoed
  const maxVoteWeight = isPluginCommunityVoting
    ? maxVoteRecord.account.maxVoterWeight
    : getProposalMaxVoteWeight(realm.account, proposal, proposalMint)

  const minimumYesVotes =
    fmtTokenAmount(maxVoteWeight, proposalMint.decimals) *
    (voteThresholdPct / 100)

  const yesVotePct = calculatePct(proposal.getYesVoteCount(), maxVoteWeight)
  const isMultiProposal = proposal?.options?.length > 1
  const yesVoteCount = !isMultiProposal
    ? fmtTokenAmount(proposal.getYesVoteCount(), proposalMint.decimals)
    : 0
  const noVoteCount = !isMultiProposal
    ? fmtTokenAmount(proposal.getNoVoteCount(), proposalMint.decimals)
    : 0

  const totalVoteCount = yesVoteCount + noVoteCount

  const getRelativeVoteCount = (voteCount: number) =>
    totalVoteCount === 0 ? 0 : (voteCount / totalVoteCount) * 100

  const relativeYesVotes = getRelativeVoteCount(yesVoteCount)
  const relativeNoVotes = getRelativeVoteCount(noVoteCount)
  const rawYesVotesRequired = minimumYesVotes - yesVoteCount
  const actualVotesRequired = rawYesVotesRequired < 0 ? 0 : rawYesVotesRequired
  const yesVoteProgress = actualVotesRequired
    ? 100 - (actualVotesRequired / minimumYesVotes) * 100
    : 100

  const yesVotesRequired =
    proposalMint.decimals == 0
      ? Math.ceil(actualVotesRequired)
      : actualVotesRequired

  const results = {
    voteThresholdPct,
    yesVotePct,
    yesVoteProgress,
    yesVoteCount,
    noVoteCount,
    relativeYesVotes,
    relativeNoVotes,
    minimumYesVotes,
    yesVotesRequired,
  }

  // @asktree: you may be asking yourself, "is this different from the more succinct way to write this?"
  // the answer is yes, in typescript it is different and this lets us use discriminated unions properly.
  if (programVersion === 1)
    return {
      _programVersion: programVersion,
      ...results,
    }
  if (programVersion === 2)
    return {
      _programVersion: programVersion,
      ...results,
    }

  // VETOS
  const vetoThreshold = isCommunityVote
    ? governance.config.councilVetoVoteThreshold
    : governance.config.communityVetoVoteThreshold

  if (vetoThreshold.value === undefined)
    return {
      _programVersion: programVersion,
      ...results,
      veto: undefined,
    }

  const vetoMintInfo = isCommunityVote ? councilMint : mint
  const vetoMintPk = isCommunityVote
    ? realm.account.config.councilMint
    : realm.account.communityMint

  // This represents an edge case where councilVetoVoteThreshold is defined but there is no councilMint
  if (vetoMintInfo === undefined || vetoMintPk === undefined)
    return {
      _programVersion: programVersion,
      ...results,
      veto: undefined,
    }

  const vetoVoteCount = fmtTokenAmount(
    proposal.vetoVoteWeight,
    vetoMintInfo.decimals
  )
  // its impossible to accurately know the veto votes required for a finalized, non-vetoed proposal
  if (proposal.isVoteFinalized() && proposal.state !== ProposalState.Vetoed)
    return {
      _programVersion: programVersion,
      ...results,
      veto: {
        votesRequired: undefined,
        voteCount: vetoVoteCount,
        voteProgress: undefined,
      },
    }

  const isPluginCommunityVeto = maxVoteRecord && !isCommunityVote
  const vetoMaxVoteWeight = isPluginCommunityVeto
    ? maxVoteRecord.account.maxVoterWeight
    : getProposalMaxVoteWeight(
        realm.account,
        proposal,
        vetoMintInfo,
        vetoMintPk
      )

  const vetoVoteProgress = calculatePct(
    proposal.vetoVoteWeight,
    vetoMaxVoteWeight
  )

  const minimumVetoVotes = vetoMaxVoteWeight
    ?.div(new BN(10).pow(new BN(vetoMintInfo.decimals ?? 0)))
    .muln(vetoThreshold.value / 100)

  const vetoVotesRequired = minimumVetoVotes.subn(vetoVoteCount).toString()

  return {
    _programVersion: programVersion,
    ...results,
    veto: {
      votesRequired: vetoVotesRequired,
      voteCount: vetoVoteCount,
      voteProgress: vetoVoteProgress,
    },
  }
}
