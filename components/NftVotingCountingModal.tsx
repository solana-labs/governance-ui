import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useTransactionsStore from 'stores/useTransactionStore'
import Modal from './Modal'

const NftVotingCountingModal = () => {
  const { processedTransactions } = useTransactionsStore()
  const {
    closeNftVotingCountingModal,
    countedNftsForProposal,
  } = useNftProposalStore()
  const { votingNfts } = useNftPluginStore((s) => s.state)
  const votingInProgress = useNftProposalStore((s) => s.votingInProgress)

  const usedNfts = countedNftsForProposal.length
  const totalVotingPower = votingNfts.length
  const remainingVotingPower = totalVotingPower - usedNfts
  //in last tx there is max of 5 nfts
  const lastTransactionNftsCount = 5
  const nftsPerTx = 8
  const calcTransactions = (nftsCount: number) => {
    let toAdd = 0
    if (processedTransactions === 0) {
      return nftsCount
    }
    if (nftsCount <= lastTransactionNftsCount) {
      toAdd = remainingVotingPower
    }
    if (
      nftsCount > lastTransactionNftsCount &&
      nftsCount < lastTransactionNftsCount + nftsPerTx
    ) {
      if (processedTransactions === 1) {
        toAdd = remainingVotingPower - lastTransactionNftsCount
      } else {
        toAdd = lastTransactionNftsCount
      }
    }
    toAdd = processedTransactions * nftsPerTx
    if (nftsCount + toAdd > totalVotingPower) {
      return totalVotingPower
    }
    return nftsCount + toAdd
  }
  const countedNfts = calcTransactions(usedNfts)

  return votingInProgress ? (
    <Modal
      bgBlack={false}
      wrapperStyle={{ top: '-350px' }}
      onClose={closeNftVotingCountingModal}
      isOpen={votingInProgress}
    >
      <h2>Voting NFT stats</h2>
      <div>
        Counted NFTS: {countedNfts} of {totalVotingPower}
      </div>
    </Modal>
  ) : null
}

export default NftVotingCountingModal
