import { Proposal } from '@solana/spl-governance'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { getProposalMaxVoteWeight } from '../models/voteWeights'
import { calculatePct, fmtTokenAmount } from '../utils/formatting'
import useProgramVersion from './useProgramVersion'
import useRealm from './useRealm'

// TODO support council plugins
export default function useProposalVotes(proposal?: Proposal) {
  const { realm, mint, councilMint, governances } = useRealm()
  const maxVoteRecord = useNftPluginStore((s) => s.state.maxVoteRecord)
  const governance =
    proposal && governances[proposal.governance?.toBase58()]?.account
  const programVersion = useProgramVersion()

  const proposalMint =
    proposal?.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
      ? mint
      : councilMint
  // TODO: optimize using memo
  if (!realm || !proposal || !governance || !proposalMint)
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
    : governance.config.councilVoteThreshold.value
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
  const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100
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
  const yesVotesRequired =
    proposalMint.decimals == 0
      ? Math.ceil(rawYesVotesRequired)
      : rawYesVotesRequired

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

  const isPluginCommunityVeto = maxVoteRecord && !isCommunityVote

  const vetoMaxVoteWeight = isPluginCommunityVeto
    ? maxVoteRecord.account.maxVoterWeight
    : getProposalMaxVoteWeight(
        realm.account,
        proposal,
        vetoMintInfo,
        vetoMintPk
      )

  const vetoVoteCount = fmtTokenAmount(
    proposal.vetoVoteWeight,
    vetoMintInfo.decimals
  )

  const vetoVoteProgress = calculatePct(
    proposal.vetoVoteWeight,
    vetoMaxVoteWeight
  )

  const minimumVetoVotes =
    fmtTokenAmount(vetoMaxVoteWeight, vetoMintInfo.decimals) *
    (vetoThreshold.value / 100)

  const vetoVotesRequired = minimumVetoVotes - vetoVoteCount

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
