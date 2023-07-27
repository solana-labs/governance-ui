import { Proposal, VoteKind } from '@solana/spl-governance'
import { useState } from 'react'
import Button, { SecondaryButton } from '../Button'
import VoteCommentModal from '../VoteCommentModal'
import {
  useIsVoting,
  useVoterTokenRecord,
  useVotingPop,
} from './hooks'
import useRealm from '@hooks/useRealm'
import { VotingClientType } from '@utils/uiTypes/VotePlugin'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import { useSubmitVote } from '@hooks/useSubmitVote'
import { useSelectedRealmInfo } from '@hooks/selectedRealm/useSelectedRealmRegistryEntry'

const useCanVote = () => {
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const { ownVoterWeight } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected

  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const voterTokenRecord = useVoterTokenRecord()

  const isVoteCast = !!ownVoteRecord?.found

  const hasMinAmountToVote =
    voterTokenRecord &&
    ownVoterWeight.hasMinAmountToVote(
      voterTokenRecord.account.governingTokenMint
    )

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

export const CastMultiVoteButtons = ({proposal} : {proposal: Proposal}) => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  const realmInfo = useSelectedRealmInfo()
  const allowDiscussion = realmInfo?.allowDiscussion ?? true
  const { multiChoiceSubmitting, multiChoiceSubmitVote } = useSubmitVote()
  const votingPop = useVotingPop()
  const voterTokenRecord = useVoterTokenRecord()
  const [canVote, tooltipContent] = useCanVote()
  const { data: ownVoteRecord } = useProposalVoteRecordQuery('electoral')
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [optionStatus, setOptionStatus] = useState<boolean[]>(new Array(proposal.options.length).fill(false));
  const isVoteCast = !!ownVoteRecord?.found
  const isVoting = useIsVoting()


  const handleVote = async (vote: 'yes' | 'no') => {
    setVote(vote)

    if (allowDiscussion) {
      setShowVoteModal(true)
    } else {
      await multiChoiceSubmitVote({
        vote: vote === 'yes' ? VoteKind.Approve : VoteKind.Deny,
        voterTokenRecord: voterTokenRecord!,
        voteWeights: selectedOptions
      })
    }
  }

  const handleOption = (index: number, insert: boolean) => {
    let options = [...selectedOptions];
    const status = [...optionStatus];

    if (insert) {
      if (!options.includes(index)) {
        options.push(index)
      }
      status[index] = true;
    } else {
      options = options.filter(option => option !== index);
      status[index] = false
    }

    setSelectedOptions(options);
    setOptionStatus(status);
  }

  return (isVoting && !isVoteCast) ? (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg space-y-4">
      <div className="flex flex-col items-center justify-center">
        <h3 className="text-center">Cast your {votingPop} vote</h3>
      </div>

      <div className="items-center justify-center flex w-full gap-5">
        <div
          className={`w-full flex flex-col justify-between items-center gap-3`}
        >
          {proposal.options.map((option, index) => {
            return (
            <div className="w-full" key={index}>
              {optionStatus[index] 
              ?
                <Button
                  tooltipMessage={tooltipContent}
                  className='w-full bg-fgd-1'
                  onClick={() => handleOption(index, false)}
                  disabled={!canVote || multiChoiceSubmitting}
                  isLoading={multiChoiceSubmitting}
                >
                  {option.label}
                </Button> 
              :
                <SecondaryButton
                tooltipMessage={tooltipContent}
                className='w-full'
                onClick={() => handleOption(index, true)}
                disabled={!canVote || multiChoiceSubmitting}
                isLoading={multiChoiceSubmitting}
              >
                {option.label}
              </SecondaryButton>
              }  
            </div>
            )}
          )}
          <Button
            tooltipMessage={
              tooltipContent === "" && !selectedOptions.length ? 
              `Select at least one option to vote` 
              : tooltipContent
            }
            className="w-full"
            onClick={() => handleVote('yes')}
            disabled={!canVote || multiChoiceSubmitting || !selectedOptions.length}
            isLoading={multiChoiceSubmitting}
          >
            <div className="flex flex-row items-center justify-center">
              Vote
            </div>
          </Button>
        </div>
      </div>

      {showVoteModal && vote ? (
        <VoteCommentModal
          isOpen={showVoteModal}
          onClose={() => setShowVoteModal(false)}
          vote={VoteKind.Approve}
          voterTokenRecord={voterTokenRecord!}
          isMulti={selectedOptions}
        />
      ) : null}
    </div>
  ) : null
}