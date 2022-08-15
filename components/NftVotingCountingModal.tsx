import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import useTransactionsStore from 'stores/useTransactionStore'
import Modal from './Modal'

const NftVotingCountingModal = () => {
  const { transactionsCount, processedTransactions } = useTransactionsStore()
  const {
    closeNftVotingCountingModal,
    countedNftsForProposal,
  } = useNftProposalStore()
  const votedNfts = countedNftsForProposal.length
  const votingInProgress = useNftProposalStore((s) => s.votingInProgress)
  return votingInProgress ? (
    <Modal
      bgBlack={false}
      wrapperStyle={{ top: '-350px' }}
      onClose={closeNftVotingCountingModal}
      isOpen={votingInProgress}
    >
      <h2>Voting NFT stats</h2>
      <div>votedNfts: {votedNfts}</div>
      <div>transactionsCount: {transactionsCount}</div>
      <div>processedTransactions: {processedTransactions}</div>
    </Modal>
  ) : null
}

export default NftVotingCountingModal
