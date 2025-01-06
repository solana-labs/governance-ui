import { VoteKind, getVoteRecordAddress } from '@solana/spl-governance'
import { useState } from 'react'
import { ThumbUpIcon, ThumbDownIcon } from '@heroicons/react/solid'
import Button from '../Button'
import VoteCommentModal from '../VoteCommentModal'
import { useIsInCoolOffTime, useIsVoting, useVotingPop } from './hooks'
import {
  fetchVoteRecordByPubkey,
  useProposalVoteRecordQuery,
} from '@hooks/queries/voteRecord'
import { useSubmitVote } from '@hooks/useSubmitVote'
import { useSelectedRealmInfo } from '@hooks/selectedRealm/useSelectedRealmRegistryEntry'
import { useCanVote } from './useCanVote'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import { useRouteProposalQuery } from '@hooks/queries/proposal'
import { useBatchedVoteDelegators } from './useDelegators'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

export const CastVoteButtons = () => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  const realmInfo = useSelectedRealmInfo()
  const allowDiscussion = realmInfo?.allowDiscussion ?? true
  const { submitting, submitVote } = useSubmitVote()
  const votingPop = useVotingPop()
  const [canVote, tooltipContent] = useCanVote()
  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')

  const isVoteCast = !!ownVoteRecord?.found
  const isVoting = useIsVoting()
  const isInCoolOffTime = useIsInCoolOffTime()

  const proposal = useRouteProposalQuery().data?.result
  const connection = useConnection()
  const communityDelegators = useBatchedVoteDelegators('community')
  const councilDelegators = useBatchedVoteDelegators('council')

  const wallet = useWalletOnePointOh()

  const { voterWeightForWallet } = useRealmVoterWeightPlugins(votingPop)

  const ownVoterWeight = wallet?.publicKey
    ? voterWeightForWallet(wallet?.publicKey)
    : undefined
  const hasVotingPower = !!(
    ownVoterWeight?.value && ownVoterWeight.value?.gtn(0)
  )

  const isDelegatorsVoteCast = useAsync(async () => {
    const relevantDelegators =
      votingPop === 'community' ? communityDelegators : councilDelegators

    if (
      !hasVotingPower &&
      proposal &&
      relevantDelegators &&
      relevantDelegators.length > 0
    ) {
      const delegatorisVoteCastList = await Promise.all(
        relevantDelegators.map(async (delegator) => {
          const pda = await getVoteRecordAddress(
            proposal.owner,
            proposal.pubkey,
            delegator.pubkey
          )
          const voteRecord = await fetchVoteRecordByPubkey(
            connection.connection,
            pda
          )
          return !!voteRecord.found
        })
      )

      // check if there is any delegator without a vote. If so, return false
      const voted = !delegatorisVoteCastList.includes(false)
      setVote(voted ? 'yes' : 'no')
      return voted
    }
  }, [
    communityDelegators?.length,
    connection.connection,
    councilDelegators?.length,
    hasVotingPower,
    proposal?.pubkey,
    votingPop,
  ])

  const handleVote = async (vote: 'yes' | 'no') => {
    setVote(vote)

    if (allowDiscussion) {
      setShowVoteModal(true)
    } else {
      await submitVote({
        vote: vote === 'yes' ? VoteKind.Approve : VoteKind.Deny,
      })
    }
  }
  const isFinalVoteCast =
    isVoteCast || hasVotingPower ? isVoteCast : isDelegatorsVoteCast.result

  return (isVoting && !isFinalVoteCast) ||
    (isInCoolOffTime && !isFinalVoteCast) ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">Cast your {votingPop} vote</h3>
      </div>

      <div className="items-center justify-center flex w-full gap-5">
        <div
          className={`w-full flex ${
            !isInCoolOffTime ? 'justify-between' : 'justify-center'
          } items-center gap-5`}
        >
          {(isVoting || !isInCoolOffTime) && (
            <Button
              tooltipMessage={tooltipContent}
              className="w-1/2"
              onClick={() => handleVote('yes')}
              disabled={!canVote || submitting}
              isLoading={submitting}
            >
              <div className="flex flex-row items-center justify-center">
                <ThumbUpIcon className="h-4 w-4 mr-2" />
                Vote Yes
              </div>
            </Button>
          )}

          <Button
            tooltipMessage={tooltipContent}
            className="w-1/2"
            onClick={() => handleVote('no')}
            disabled={!canVote || submitting}
            isLoading={submitting}
          >
            <div className="flex flex-row items-center justify-center">
              <ThumbDownIcon className="h-4 w-4 mr-2" />
              Vote No
            </div>
          </Button>
        </div>
      </div>

      {showVoteModal && vote ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          vote={vote === 'yes' ? VoteKind.Approve : VoteKind.Deny}
        />
      ) : null}
    </div>
  ) : null
}
