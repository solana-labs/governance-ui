import { useVoterTokenRecord, useVotingPop } from './hooks'
import { VotingClientType } from '@utils/uiTypes/VotePlugin'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import { useGovernancePowerAsync } from '@hooks/queries/governancePower'

import { useBatchedVoteDelegators } from './useDelegators'

const useHasAnyVotingPower = (role: 'community' | 'council' | undefined) => {
  const { result: personalAmount } = useGovernancePowerAsync(role)
  const relevantDelegators = useBatchedVoteDelegators(role)

  // notably, this is ignoring whether the delegators actually have voting power, but it's not a big deal
  const canBatchVote = relevantDelegators && relevantDelegators?.length !== 0

  // technically, if you have a TOR you can vote even if there's no power. But that doesnt seem user friendly.
  const canPersonallyVote =
    personalAmount === undefined ? undefined : personalAmount.isZero() === false

  const canVote = canBatchVote || canPersonallyVote

  return canVote
}

export const useCanVote = () => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const votingPop = useVotingPop()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const voterTokenRecord = useVoterTokenRecord()

  const isVoteCast = !!ownVoteRecord?.found

  const hasMinAmountToVote = useHasAnyVotingPower(votingPop)

  const canVote =
    connected &&
    !(
      client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ) &&
    !(
      client.clientType === VotingClientType.HeliumVsrClient &&
      !voterTokenRecord
    ) &&
    !isVoteCast &&
    hasMinAmountToVote

  const voteTooltipContent = !connected
    ? 'You need to connect your wallet to be able to vote'
    : client.clientType === VotingClientType.NftVoterClient && !voterTokenRecord
    ? 'You must join the Realm to be able to vote'
    : !hasMinAmountToVote
    ? 'You don’t have governance power to vote in this dao'
    : ''

  return [canVote, voteTooltipContent] as const
}
