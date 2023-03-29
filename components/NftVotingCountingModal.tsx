import { usePrevious } from '@hooks/usePrevious'
import useWalletGay from '@hooks/useWallet'
import { NftVoterClient } from '@solana/governance-program-library'
import useNftProposalStore from 'NftVotePlugin/NftProposalStore'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import { useEffect, useState } from 'react'
import useTransactionsStore from 'stores/useTransactionStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import Modal from './Modal'

const NftVotingCountingModal = () => {
  const votingInProgress = useNftProposalStore((s) => s.votingInProgress)
  return votingInProgress ? <NftVotingComponent></NftVotingComponent> : null
}

const NftVotingComponent = () => {
  const { processedTransactions } = useTransactionsStore()
  const prevProcessedTransactions = usePrevious(processedTransactions)
  const {
    closeNftVotingCountingModal,
    countedNftsForProposal,
    proposal,
  } = useNftProposalStore()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const wallet = useWalletGay()
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
    if (processedTransactions !== 0) {
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [processedTransactions])

  return votingInProgress ? (
    <Modal
      bgClickClose={false}
      bgBlack={false}
      zIndex={'z-[31]'}
      wrapperStyle={{ top: '-350px' }}
      onClose={() =>
        closeNftVotingCountingModal(
          client.client as NftVoterClient,
          proposal!,
          wallet!.publicKey!
        )
      }
      isOpen={votingInProgress}
    >
      <h2>NFT voting progress</h2>
      <div>
        {usedNftsCount} counted out of {totalVotingPower}
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
        Vote will be cast once all the NFTs are counted
      </div>
    </Modal>
  ) : null
}

export default NftVotingCountingModal
