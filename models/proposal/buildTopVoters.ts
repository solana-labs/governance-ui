import {
  ProgramAccount,
  VoteRecord,
  TokenOwnerRecord,
  Realm,
  Proposal,
  VoteKind,
} from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import BN from 'bn.js'
import { PublicKey } from '@solana/web3.js'
import { BigNumber } from 'bignumber.js'

import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'

export enum VoteType {
  No,
  Undecided,
  Yes,
}

export interface VoterDisplayData {
  decimals: number
  name: PublicKey
  voteType: VoteType
  votesCast: BN
  votePercentage: number
  key: string
}

const buildResults = (
  key: PublicKey,
  amount: BN,
  label: VoteType,
  total: BN,
  decimals: number
) => ({
  decimals,
  name: key,
  voteType: label,
  votesCast: amount,
  key: key.toBase58(),
  votePercentage: new BigNumber(amount.toString())
    .shiftedBy(2)
    .dividedBy(new BigNumber(total.toString()))
    .toNumber(),
})

const ZERO = new BN(0)

export function buildTopVoters(
  voteRecords: ProgramAccount<VoteRecord>[],
  tokenOwnerRecords: ProgramAccount<TokenOwnerRecord>[],
  realm: ProgramAccount<Realm>,
  proposal: ProgramAccount<Proposal>,
  governingTokenMint: MintInfo,
  undecidedVoterWeightByWallets: { [walletPk: string]: BN }
): VoterDisplayData[] {
  const maxVote = calculateMaxVoteScore(realm, proposal, governingTokenMint)

  const electoralVotes = voteRecords.filter(
    (x) => x.account.vote?.voteType !== VoteKind.Veto
  )
  const undecidedData = tokenOwnerRecords
    .filter(
      (tokenOwnerRecord) =>
        !electoralVotes.some(
          (voteRecord) =>
            voteRecord.account.governingTokenOwner.toBase58() ===
            tokenOwnerRecord.account.governingTokenOwner.toBase58()
        )
    )
    .map((record) => {
      const tokenAmount = Object.keys(undecidedVoterWeightByWallets).length
        ? record.account.governingTokenDepositAmount.add(
            undecidedVoterWeightByWallets[
              record.account.governingTokenOwner.toBase58()
            ] || new BN(0)
          )
        : record.account.governingTokenDepositAmount
      return buildResults(
        record.account.governingTokenOwner,
        tokenAmount,
        VoteType.Undecided,
        maxVote,
        governingTokenMint.decimals
      )
    })
    .filter((x) => !x.votesCast.isZero())

  const noVoteData = electoralVotes
    .filter((record) => record.account.getNoVoteWeight()?.gt(ZERO))
    .map((record) =>
      buildResults(
        record.account.governingTokenOwner,
        record.account.getNoVoteWeight()!,
        VoteType.No,
        maxVote,
        governingTokenMint.decimals
      )
    )

  const yesVoteData = electoralVotes
    .filter((record) => record.account.getYesVoteWeight()?.gt(ZERO))
    .map((record) =>
      buildResults(
        record.account.governingTokenOwner,
        record.account.getYesVoteWeight()!,
        VoteType.Yes,
        maxVote,
        governingTokenMint.decimals
      )
    )

  return undecidedData
    .concat(yesVoteData)
    .concat(noVoteData)
    .sort((a, b) => b.votesCast.cmp(a.votesCast))
}

export function buildTopNftVoters(
  voteRecords: ProgramAccount<VoteRecord>[],
  tokenOwnerRecords: ProgramAccount<TokenOwnerRecord>[],
  governingTokenMint: MintInfo,
  nftVoterPluginTotalWeight: BN
): VoterDisplayData[] {
  const electoralVotes = voteRecords.filter(
    (x) => x.account.vote?.voteType !== VoteKind.Veto
  )
  const undecidedData = tokenOwnerRecords
    .filter(
      (tokenOwnerRecord) =>
        !electoralVotes.some(
          (voteRecord) =>
            voteRecord.account.governingTokenOwner.toBase58() ===
            tokenOwnerRecord.account.governingTokenOwner.toBase58()
        )
    )
    .map((record) => {
      const tokenAmount = new BN(0)
      return buildResults(
        record.account.governingTokenOwner,
        tokenAmount,
        VoteType.Undecided,
        nftVoterPluginTotalWeight,
        governingTokenMint.decimals
      )
    })

  const noVoteData = electoralVotes
    .filter((record) => record.account.getNoVoteWeight()?.gt(ZERO))
    .map((record) =>
      buildResults(
        record.account.governingTokenOwner,
        record.account.getNoVoteWeight()!,
        VoteType.No,
        nftVoterPluginTotalWeight,
        governingTokenMint.decimals
      )
    )

  const yesVoteData = electoralVotes
    .filter((record) => record.account.getYesVoteWeight()?.gt(ZERO))
    .map((record) =>
      buildResults(
        record.account.governingTokenOwner,
        record.account.getYesVoteWeight()!,
        VoteType.Yes,
        nftVoterPluginTotalWeight,
        governingTokenMint.decimals
      )
    )

  return undecidedData
    .concat(yesVoteData)
    .concat(noVoteData)
    .sort((a, b) => b.votesCast.cmp(a.votesCast))
}
