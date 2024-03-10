import VanillaVotingPower from "@components/GovernancePower/Power/Vanilla/VanillaVotingPower";
import {Deposit} from "@components/GovernancePower/Power/Vanilla/Deposit";
import { VotingCardProps } from "../VotingPowerCards";
import {FC} from "react";

export const VanillaCard:FC<VotingCardProps & { unrecognizedPlugin?: boolean }> = (props) => (
    <div>
        <VanillaVotingPower {...props} />
        <Deposit role={props.role}/>
    </div>
)