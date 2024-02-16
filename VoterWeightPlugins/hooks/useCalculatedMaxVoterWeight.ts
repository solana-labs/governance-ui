import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {useState} from "react";
import { calculateMaxVoterWeight } from "../lib/calculateVoterWeights";
import {MintInfo} from "@solana/spl-token";
import queryClient from "@hooks/queries/queryClient";

type Args = Omit<UseVoterWeightPluginsArgs, 'walletPublicKey'> & {
    plugins?: VoterWeightPluginInfo[],
    mintInfo?: MintInfo
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined &&
    args.plugins !== undefined && args.mintInfo !== undefined

export const useCalculatedMaxVoterWeight = (args: Args): CalculatedWeight | undefined => {
    const [weight, setWeight] = useState<CalculatedWeight>()

    if (argsAreSet(args)) {
        queryClient.fetchQuery({
            queryKey: [
                'calculateMaxVoterWeight',
                args.realmPublicKey.toString(),
                args.governanceMintPublicKey.toString(),
            ],
            queryFn: () => calculateMaxVoterWeight(args),
        }).then(setWeight);
    }

    return weight;
}