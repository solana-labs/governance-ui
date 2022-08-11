import { NftVoterClient } from '@solana/governance-program-library'
import { ChatMessageBody } from '@solana/spl-governance'
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import { VotingClient } from '@utils/uiTypes/VotePlugin'
import {
  getNftVoteRecordProgramAddress,
  getUsedNftsForProposal,
} from 'NftVotePlugin/accounts'

//lamports costs hardcoded for now.
//TODO figure out better cost handling
const castVoteIxAndUpdateVoterWeightIxCost = 1515320
const oneNftCost = 1670400
const commentCostIx = 1673440
const commentCharacterCost = 6960
const singleTransactionCosts = 5000

export const calcCostOfNftVote = async (
  comment: ChatMessageBody | undefined,
  numberOfTransactions: number,
  proposalPk: PublicKey,
  votingPlugin: VotingClient
) => {
  let nftToVoteCount = 0
  const voterNfts = votingPlugin.votingNfts

  const nftsAlreadyUsedToVote = await getUsedNftsForProposal(
    votingPlugin.client as NftVoterClient,
    proposalPk
  )
  if (nftsAlreadyUsedToVote.length > 0) {
    for (const nft of voterNfts) {
      const { nftVoteRecord } = await getNftVoteRecordProgramAddress(
        proposalPk,
        nft.mintAddress,
        votingPlugin.client!.program.programId!
      )
      if (
        !nftsAlreadyUsedToVote.find(
          (x) => x.publicKey.toBase58() === nftVoteRecord.toBase58()
        )
      ) {
        nftToVoteCount++
      }
    }
  } else {
    nftToVoteCount = voterNfts.length
  }

  let baseCost = castVoteIxAndUpdateVoterWeightIxCost
  const nftVotesCosts = oneNftCost * nftToVoteCount
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
