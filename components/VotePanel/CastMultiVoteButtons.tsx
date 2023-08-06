import { Proposal, VoteKind } from '@solana/spl-governance'
import { CheckCircleIcon } from "@heroicons/react/solid";
import { useState } from 'react'
import Button, { SecondaryButton } from '../Button'
import VoteCommentModal from '../VoteCommentModal'
import {
  useIsVoting,
  useVoterTokenRecord,
  useVotingPop,
} from './hooks'
import { useProposalVoteRecordQuery } from '@hooks/queries/voteRecord'
import { useSubmitVote } from '@hooks/useSubmitVote'
import { useSelectedRealmInfo } from '@hooks/selectedRealm/useSelectedRealmRegistryEntry'
import { useCanVote } from './CastVoteButtons'

export const CastMultiVoteButtons = ({proposal} : {proposal: Proposal}) => {
  const [showVoteModal, setShowVoteModal] = useState(false)
  const [vote, setVote] = useState<'yes' | 'no' | null>(null)
  const realmInfo = useSelectedRealmInfo()
  const allowDiscussion = realmInfo?.allowDiscussion ?? true
  const { submitting, submitVote } = useSubmitVote()
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
      await submitVote({
        vote: vote === 'yes' ? VoteKind.Approve : VoteKind.Deny,
        voterTokenRecord: voterTokenRecord!,
        voteWeights: selectedOptions
      })
    }
  }

  const handleOption = (index: number) => {
    let options = [...selectedOptions];
    let status = [...optionStatus];
    const nota = "none of the above";
    const last = proposal.options.length - 1;
    const isNota = proposal.options[last].label.toLowerCase() === nota;

    const selected = status[index];

    if (selected) {
      options = options.filter(option => option !== index);
      status[index] = false
    } else {
      if (isNota) {
        if (index === last) {
          // if nota is clicked, unselect all other options
          status = status.map(() => false);
          status[index] = true;
          options = [index];
        } else {
          // remove nota from the selected if any other option is clicked
          status[last] = false;
          options = options.filter(option => option !== last);
          if (!options.includes(index)) {
            options.push(index)
          }
          status[index] = true;
        }
      } else {
        if (!options.includes(index)) {
          options.push(index)
        }
        status[index] = true;
      }
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
                <SecondaryButton
                  tooltipMessage={tooltipContent}
                  className={`
                    ${optionStatus[index] ? 
                      'bg-primary-light text-bkg-2 hover:text-bkg-2 hover:border-primary-light' : 
                      'bg-transparent'}
                    rounded-lg w-full
                  `}
                  onClick={() => handleOption(index)}
                  disabled={!canVote || submitting}
                  isLoading={submitting}
                >
                  {optionStatus[index] && <CheckCircleIcon  className="inline w-4 mr-1"/>}
                  {option.label}
                </SecondaryButton>
              </div>
            )}
          )}
          <div className="text-xs">
            Note: You can select one or more options
          </div>
          <Button
            tooltipMessage={
              tooltipContent === "" && !selectedOptions.length ? 
              `Select at least one option to vote` 
              : tooltipContent
            }
            className="w-full"
            onClick={() => handleVote('yes')}
            disabled={!canVote || submitting || !selectedOptions.length}
            isLoading={submitting}
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