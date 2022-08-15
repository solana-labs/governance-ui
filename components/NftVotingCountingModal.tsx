import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useTransactionsStore from 'stores/useTransactionStore'
import Modal from './Modal'

const NftVotingCountingModal = () => {
  const { transactionsCount, processedTransactions } = useTransactionsStore()
  const {
    closeNftVotingCountingModal,
    countedNftsForProposal,
  } = useNftProposalStore()
  const { votingNfts } = useNftPluginStore((s) => s.state)
  const votingInProgress = useNftProposalStore((s) => s.votingInProgress)

  const usedNfts = countedNftsForProposal.length
  const totalVotingPower = votingNfts.length
  const remainingVotingPower = totalVotingPower - usedNfts
  const lastTransactionNftsCount = 5
  const nftsPerTx = 8

  const countedNfts = usedNfts

  return votingInProgress ? (
    <Modal
      bgBlack={false}
      wrapperStyle={{ top: '-350px' }}
      onClose={closeNftVotingCountingModal}
      isOpen={votingInProgress}
    >
      <h2>Voting NFT stats</h2>
      <div>Counted NFTS: {votedNfts}</div>
      <div>transactionsCount: {transactionsCount}</div>
      <div>processedTransactions: {processedTransactions}</div>
    </Modal>
  ) : null
}

export default NftVotingCountingModal
