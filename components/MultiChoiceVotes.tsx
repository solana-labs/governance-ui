import { Proposal, ProposalState } from '@solana/spl-governance'
import { useRealmQuery } from '@hooks/queries/realm'
import {
  useRealmCommunityMintInfoQuery,
  useRealmCouncilMintInfoQuery,
} from '@hooks/queries/mintInfo'
import { BN } from '@coral-xyz/anchor'
import { StyledLabel, StyledSubLabel } from './inputs/styles'
import { ChevronRight } from '@carbon/icons-react'
import { CheckCircleIcon } from '@heroicons/react/solid'
import { fmtBnMintDecimals } from '@tools/sdk/units'
import BigNumber from 'bignumber.js'

const MultiChoiceVotes = ({
  proposal,
  limit,
}: {
  proposal: Proposal
  limit: number
}) => {
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const councilMint = useRealmCouncilMintInfoQuery().data?.result

  const proposalMint =
    proposal.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
      ? mint
      : councilMint

  const totalVoteWeight = proposal.options.reduce(
    (a, b) => a.add(b.voteWeight),
    new BN(0)
  )

  const isComplete = proposal.state === ProposalState.Completed
  let highestWeight = new BN(0)

  for (const option of proposal.options) {
    highestWeight = option.voteWeight.gt(highestWeight)
      ? option.voteWeight
      : highestWeight
  }

  const nota = '$$_NOTA_$$'
  const last = proposal.options.length - 1

  return (
    <div className="border border-fgd-4 rounded-md">
      {proposal.options.slice(0, limit).map((option, index) => {
        const optionVotes = option.voteWeight
        const optionWeightPct = optionVotes.muln(1000).div(totalVoteWeight)

        return (
          <div className="border-b border-fgd-4 p-5" key={index}>
            <div className="flex flex-row justify-between gap-2">
              <div className="flex flex-row justify-start">
                <StyledLabel>
                  {option.label === nota && index === last
                    ? 'None of the Above'
                    : option.label}
                </StyledLabel>
                {proposalMint === undefined ? null : (
                  <StyledSubLabel>
                    {new BigNumber(optionVotes.toString())
                      .shiftedBy(-proposalMint.decimals)
                      .toFormat(0)}{' '}
                    votes
                  </StyledSubLabel>
                )}
              </div>
              <div className="text-sm">
                {isComplete &&
                  !highestWeight.eq(new BN(0)) &&
                  option.voteWeight.eq(highestWeight) && (
                    <CheckCircleIcon className="inline w-4 mr-1" />
                  )}
                {fmtBnMintDecimals(optionWeightPct, 1)}%
              </div>
            </div>
            <div className="bg-bkg-4 h-1 flex flex-grow mt-1.5 rounded w-full">
              <div
                style={{
                  width: `${optionWeightPct.divn(10)}%`,
                }}
                className={`bg-primary-light flex rounded-l ${
                  0 < 0.01 && 'rounded'
                }`}
              ></div>
            </div>
          </div>
        )
      })}
      {limit < proposal.options.length && (
        <div className="border border-fgd-4 rounded-lg p-4">
          <StyledSubLabel className="flex flex-row gap-2">
            <div className="">
              {proposal.options.length - limit} more choice
              {proposal.options.length - limit !== 1 && 's'}{' '}
            </div>
            <ChevronRight />
          </StyledSubLabel>
        </div>
      )}
    </div>
  )
}

export default MultiChoiceVotes
