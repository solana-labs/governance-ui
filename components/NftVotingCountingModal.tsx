import { usePrevious } from '@hooks/usePrevious'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { useEffect, useState } from 'react'
import useTransactionsStore from 'stores/useTransactionStore'
import Modal from './Modal'

const NftVotingCountingModal = () => {
  const { processedTransactions } = useTransactionsStore()
  const prevProcessedTransactions = usePrevious(processedTransactions)
  const {
    closeNftVotingCountingModal,
    countedNftsForProposal,
  } = useNftProposalStore()
  const { votingNfts } = useNftPluginStore((s) => s.state)
  const votingInProgress = useNftProposalStore((s) => s.votingInProgress)
  const usedNfts = countedNftsForProposal.length
  const totalVotingPower = votingNfts.length
  const remainingNftsToCount = totalVotingPower - usedNfts
  //in last tx there is max of 5 nfts
  const lastTransactionNftsCount = 5
  const maxNftsPerTransaction = 8

  const [usedNftsCount, setUsedNftsCount] = useState(0)
  const [remainingVotingPower, setRemainingVotingPower] = useState(0)
  const handleCalcCountedNfts = (val: number) => {
    setUsedNftsCount(usedNftsCount + val)
    setRemainingVotingPower(remainingVotingPower - val)
  }

  useEffect(() => {
    setUsedNftsCount(usedNfts)
    setRemainingVotingPower(remainingNftsToCount)
  }, [usedNfts, remainingNftsToCount])

  useEffect(() => {
    const multiplier = processedTransactions - prevProcessedTransactions
    if (remainingVotingPower <= lastTransactionNftsCount) {
      handleCalcCountedNfts(remainingVotingPower)
    }
    if (
      remainingVotingPower > lastTransactionNftsCount &&
      remainingVotingPower < lastTransactionNftsCount + maxNftsPerTransaction
    ) {
      handleCalcCountedNfts(remainingVotingPower - lastTransactionNftsCount)
    }
    if (
      remainingVotingPower >=
      lastTransactionNftsCount + maxNftsPerTransaction
    ) {
      handleCalcCountedNfts(
        multiplier > 0
          ? multiplier * maxNftsPerTransaction
          : maxNftsPerTransaction
      )
    }
  }, [processedTransactions])

  return votingInProgress ? (
    <Modal
      bgBlack={false}
      zIndex={'z-[31]'}
      wrapperStyle={{ top: '-350px' }}
      onClose={closeNftVotingCountingModal}
      isOpen={votingInProgress}
    >
      <h2>Voting NFT stats</h2>
      <div>
        Counted NFTS: {usedNftsCount} out of {totalVotingPower}
      </div>
      <div className="pb-5 pt-2">
        <div className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="h-4 bg-gray-600 rounded-full dark:bg-gray-300 animate-pulse"
            style={{
              width: `${(usedNftsCount * 100) / totalVotingPower}%`,
            }}
          ></div>
        </div>
      </div>
      <div className="text-xs">
        Vote will be cast at the end of NFTS count. All NFTS need to be counted
        in order to cast vote.
      </div>
    </Modal>
  ) : null
}

export default NftVotingCountingModal
