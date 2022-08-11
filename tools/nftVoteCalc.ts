import { ChatMessageBody } from '@solana/spl-governance'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { notify } from '@utils/notifications'

export const calcCostOfNftVote = (
  nftCount: number,
  comment: ChatMessageBody | undefined,
  numberOfTransactions: number
) => {
  //lamports costs hardcoded for now.
  //TODO figure out better cost handling
  const castVoteIxAndUpdateVoterWeightIxCost = 1515320
  const oneNftCost = 1670400
  const commentCostIx = 1673440
  const commentCharacterCost = 6960
  const singleTransactionCosts = 5000

  let baseCost = castVoteIxAndUpdateVoterWeightIxCost
  const nftVotesCosts = oneNftCost * nftCount
  if (comment) {
    baseCost += commentCostIx + comment.value.length * commentCharacterCost
  }
  const pureTransactionsCosts = numberOfTransactions * singleTransactionCosts
  const totalVoteCost = nftVotesCosts + baseCost + pureTransactionsCosts
  return totalVoteCost
}

export const checkHasEnoughSolToVote = async (
  totalVoteCost: number,
  walletPk: PublicKey,
  connection: Connection
) => {
  const currentWalletSol = await connection.getBalance(walletPk)
  const hasEnoughSol = currentWalletSol - totalVoteCost > 0

  if (!hasEnoughSol) {
    notify({
      type: 'error',
      message: `Your wallet don't have enough SOL to vote. You need at least ${
        totalVoteCost / LAMPORTS_PER_SOL
      } SOL to vote`,
    })
  }
  return hasEnoughSol
}
