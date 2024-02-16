import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import { calculateVoterWeight } from "../lib/calculateVoterWeights";
import {useState} from "react";
import queryClient from "@hooks/queries/queryClient";

type Args = UseVoterWeightPluginsArgs & {
    plugins?: VoterWeightPluginInfo[],
    tokenOwnerRecord?: ProgramAccount<TokenOwnerRecord>
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined &&
    args.plugins !== undefined && args.tokenOwnerRecord !== undefined

export const useCalculatedVoterWeight = (args: Args): CalculatedWeight | undefined => {
    const [weight, setWeight] = useState<CalculatedWeight>()

    if (!argsAreSet(args)) return undefined;

    queryClient.fetchQuery({
        queryKey: [
            'calculateVoterWeight',
            args.realmPublicKey.toString(),
            args.governanceMintPublicKey.toString(),
            args.walletPublicKey.toString(),
        ],
        queryFn: () => calculateVoterWeight(args),
    }).then(setWeight);

    return weight;
}