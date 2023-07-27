import { Proposal, ProposalState } from "@solana/spl-governance"
import { useRealmQuery } from "@hooks/queries/realm";
import { useRealmCommunityMintInfoQuery, useRealmCouncilMintInfoQuery } from "@hooks/queries/mintInfo";
import { BN } from '@coral-xyz/anchor'
import { fmtTokenAmount } from "@utils/formatting";
import { StyledLabel, StyledSubLabel } from "./inputs/styles";
import { ChevronRight } from "@carbon/icons-react";
import { CheckCircleIcon } from "@heroicons/react/solid";

const MultiChoiceVotes = ({proposal, limit} : {proposal: Proposal, limit: number}) => {
    const realm = useRealmQuery().data?.result
    const mint = useRealmCommunityMintInfoQuery().data?.result
    const councilMint = useRealmCouncilMintInfoQuery().data?.result

    const proposalMint =
    proposal.governingTokenMint.toBase58() ===
    realm?.account.communityMint.toBase58()
      ? mint
      : councilMint
    
    const totalVoteWeight = fmtTokenAmount(
        proposal.options.reduce((a, b) => a.add(b.voteWeight), new BN(0)),
        proposalMint?.decimals
    );
    
    const isComplete = proposal.state === ProposalState.Completed;
    let highestWeight = new BN(0);
    
    for (const option of proposal.options) {
        highestWeight = option.voteWeight.gt(highestWeight) ? option.voteWeight : highestWeight;
    }

    return (
        <div className="">
            {proposal.options.slice(0, limit).map((option, index) => {
                const optionVotes = fmtTokenAmount(option.voteWeight, proposalMint?.decimals);
                const optionWeightPct = totalVoteWeight ? (optionVotes/totalVoteWeight) * 100 : 0;

                return (
                <div className="border border-fgd-4 p-4" key={index}>
                    <div className="flex flex-row justify-between gap-2">
                        <div className="flex flex-row justify-start">
                            <StyledLabel>{option.label}</StyledLabel>
                            <StyledSubLabel>{optionVotes.toLocaleString()} votes</StyledSubLabel>
                        </div>
                        <div className="text-sm">
                            {isComplete && !highestWeight.eq(new BN(0)) && option.voteWeight.eq(highestWeight)
                            && <CheckCircleIcon  className="inline w-4 mr-1"/>
                            }
                            {optionWeightPct.toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-bkg-4 h-1 flex flex-grow mt-1.5 rounded w-full">
                    <div
                        style={{
                            width: `${optionWeightPct > 2 || optionWeightPct < 0.01
                                ? optionWeightPct
                                : 2
                            }%`,
                        }}
                        className={`bg-primary-light flex rounded-l ${
                            0 < 0.01 && 'rounded'
                        }`}
                    ></div></div>
                </div>
            )}
            )}
            {limit < proposal.options.length &&
                <div className="border border-fgd-4 p-4">
                    <StyledSubLabel className="flex flex-row gap-2">
                        <div className="">{proposal.options.length - limit} more choice{
                            proposal.options.length - limit !== 1 && "s"
                        } </div>
                        <ChevronRight />
                    </StyledSubLabel>
                </div>
            }
        </div>
    )
}

export default MultiChoiceVotes