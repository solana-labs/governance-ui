import { useVoterTokenRecord, useVotingPop } from './hooks'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'

import { useBatchedVoteDelegators } from './useDelegators'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

const useHasAnyVotingPower = (role: 'community' | 'council' | undefined) => {
  const { calculatedVoterWeight, isReady } = useRealmVoterWeightPlugins(role)
  const relevantDelegators = useBatchedVoteDelegators(role)

  // notably, this is ignoring whether the delegators actually have voting power, but it's not a big deal
  const canBatchVote = relevantDelegators && relevantDelegators?.length !== 0

  // technically, if you have a TOR you can vote even if there's no power. But that doesnt seem user friendly.
  const canPersonallyVote =
    !isReady || !calculatedVoterWeight?.value
      ? undefined
      : calculatedVoterWeight.value.isZero() === false

  const canVote = canBatchVote || canPersonallyVote

  return canVote
}

export const useCanVote = () => {
  const { isReady, includesPlugin } = useRealmVoterWeightPlugins()
  const votingPop = useVotingPop()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const voterTokenRecord = useVoterTokenRecord()
  const { plugins } = useRealmVoterWeightPlugins(votingPop);


  const hasAllVoterWeightRecords = (plugins?.voterWeight ?? []).every((plugin) => plugin.weight !== undefined)
  const isVoteCast = !!ownVoteRecord?.found

  const hasMinAmountToVote = useHasAnyVotingPower(votingPop)

  const canVote =
    connected &&
    !(isReady && includesPlugin('NFT') && !voterTokenRecord) &&
    !(isReady && includesPlugin('HeliumVSR') && !voterTokenRecord) &&
    hasAllVoterWeightRecords &&
    !isVoteCast &&
    hasMinAmountToVote

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : isReady && includesPlugin('NFT') && !voterTokenRecord
    ? 'You must join the Realm to be able to vote'
    : !hasMinAmountToVote
    ? 'You don’t have governance power to vote in this dao'
    : ''

  return [canVote, voteTooltipContent] as const
}
