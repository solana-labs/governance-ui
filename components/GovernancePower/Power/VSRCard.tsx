import {FC} from "react";
import {useUserCommunityTokenOwnerRecord} from "@hooks/queries/tokenOwnerRecord";
import LockedCommunityVotingPower from "@components/ProposalVotingPower/LockedCommunityVotingPower";
import VanillaVotingPower from "@components/GovernancePower/Power/Vanilla/VanillaVotingPower";
import {ExclamationIcon} from "@heroicons/react/solid";
import VanillaWithdrawTokensButton from "@components/TokenBalance/VanillaWithdrawTokensButton";
import {VotingCardProps} from "@components/GovernancePower/Power/VotingPowerCards";

export const VSRCard: FC<VotingCardProps> = ({role, ...props}) => {
    const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result

    //VSR if dao transited to use plugin and some users have still deposited tokens they should withdraw before
    //depositing to plugin
    const didWithdrawFromVanillaSetup =
        !ownTokenRecord ||
        ownTokenRecord.account.governingTokenDepositAmount.isZero()

    return (
        didWithdrawFromVanillaSetup ? (
            <LockedCommunityVotingPower/>
        ) : (
            //TODO make a better generic little prompt for when a plugin is used but there are still tokens in vanilla
            <>
                <VanillaVotingPower role="community" {...props} />
                <div className="flex flex-col gap-2">
                    <div>
                        <small className="flex items-center mt-3 text-xs">
                            <ExclamationIcon className="w-5 h-5 mr-2"></ExclamationIcon>
                            Please withdraw your tokens and deposit again to get
                            governance power
                        </small>
                    </div>
                    <div>
                        <VanillaWithdrawTokensButton role={role}/>
                    </div>
                </div>
            </>
        )
    )
}