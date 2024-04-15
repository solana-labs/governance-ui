import {useVoterTokenRecord, useVotingPop} from './hooks'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import {useProposalVoteRecordQuery} from '@hooks/queries/voteRecord'
import {useRealmVoterWeightPlugins} from '@hooks/useRealmVoterWeightPlugins'
import {useDelegatorAwareVoterWeight} from "@hooks/useDelegatorAwareVoterWeight";

const useHasAnyVotingPower = (role: 'community' | 'council' | undefined) => {
  const voterWeight = useDelegatorAwareVoterWeight(role ?? 'community');
  const {isReady } = useRealmVoterWeightPlugins(role)
  return isReady && !!voterWeight?.value && voterWeight.value?.isZero() === false
}

export const useCanVote = () => {
  const { isReady, includesPlugin } = useRealmVoterWeightPlugins()
  const votingPop = useVotingPop()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const voterTokenRecord = useVoterTokenRecord()
  const { plugins } = useRealmVoterWeightPlugins(votingPop);

  const hasAllVoterWeightRecords = (plugins?.voterWeight ?? []).every((plugin) => plugin.weights !== undefined)
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
