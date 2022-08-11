import { ChatMessageBody } from '@solana/spl-governance'

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
