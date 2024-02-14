import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import {UsePluginsArgs, VoterWeightPluginInfo} from "../types";
import {calculateVoterWeight} from "../calculateVoterWeight";
import {useState} from "react";
import BN from "bn.js";
import queryClient from "@hooks/queries/queryClient";

type Args = UsePluginsArgs & {
    plugins?: VoterWeightPluginInfo[],
    tokenOwnerRecord?: ProgramAccount<TokenOwnerRecord>
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined &&
    args.plugins !== undefined && args.tokenOwnerRecord !== undefined

export const useCalculatedVoterWeight = (args: Args): BN | null => {
    const [weight, setWeight] = useState<BN | null>(null)

    if (argsAreSet(args)) {
        queryClient.fetchQuery({
            queryKey: [
                'calculateVoterWeight',
                args.realmPublicKey,
                args.governanceMintPublicKey,
                args.walletPublicKey,
            ],
            queryFn: () => calculateVoterWeight(args),
        }).then(setWeight);
    }

    return weight;
}