import { useState } from 'react'

import { InformationCircleIcon, UserGroupIcon } from '@heroicons/react/solid'
import Modal from '@components/Modal'

interface QuadraticVotingInfoModalProps {
  voteWeight: string
  totalVoteWeight: string
  totalMembers: number
  tokenAmount: string
}

export default function QuadraticVotingInfoModal({
  voteWeight,
  totalVoteWeight,
  totalMembers,
  tokenAmount,
}: QuadraticVotingInfoModalProps) {
  const [showQuadraticModal, setShowQuadraticModal] = useState(false)

  return (
    <div>
      <span>
        <InformationCircleIcon
          className="w-5 h-5 ml-1 mb-1 cursor-pointer"
          onClick={() => setShowQuadraticModal(true)}
        />
      </span>
      {showQuadraticModal && (
        <Modal
          sizeClassName="sm:max-w-3xl"
          onClose={() => setShowQuadraticModal(false)}
          isOpen={showQuadraticModal}
        >
          <div className="p-4">
            <div className="bg-bkg-1 p-4 rounded-lg mb-8 flex flex-row justify-evenly">
              <div className="flex flex-col items-end">
                <div className="flex-col items-center">
                  <p className="font-bold mr-2 text-xl">
                    {voteWeight ?? '0'} votes
                  </p>
                  <p className="text-fgd-3 text-xs justify-self">
                    ({tokenAmount ?? '0'} tokens)
                  </p>
                </div>
              </div>
              <UserGroupIcon className="w-12 h-12" />
              <div className="flex flex-col">
                <p className="text-fgd-3">{totalMembers} DAO members</p>
                <p className="text-fgd-3">holding {totalVoteWeight} tokens</p>
              </div>
            </div>
            <div className="flex justify-start items-start mb-6">
              <div>
                <h2>What is Quadratic Voting?</h2>
                <div>
                  Quadratic voting empowers individual voter groups, lessening
                  the influence of token-rich whales and giving more of a
                  proportional vote to smaller token holders.
                </div>
              </div>
            </div>
            <div className="flex justify-start items-start mb-6">
              <div>
                <h2>How is it calculated?</h2>
                <div>
                  Quadratic voting is based on the square root of the amount of
                  tokens held by a member. The result is the number of{' '}
                  <i>actual</i> votes.
                </div>
              </div>
            </div>
            <div className="flex justify-start items-start ">
              <div>
                <div className="mb-2">Example Calculation: </div>

                <div>
                  1 votes = 1 token
                  <br />
                  2 votes = 4 tokens
                  <br />3 votes = 9 tokens
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
