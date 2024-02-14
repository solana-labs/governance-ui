import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../types";
import {useState} from "react";
import BN from "bn.js";
import {calculateMaxVoterWeight} from "../calculateMaxVoterWeight";
import {MintInfo} from "@solana/spl-token";
import queryClient from "@hooks/queries/queryClient";

type Args = Omit<UseVoterWeightPluginsArgs, 'walletPublicKey'> & {
    plugins?: VoterWeightPluginInfo[],
    mintInfo?: MintInfo
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined &&
    args.plugins !== undefined && args.mintInfo !== undefined

export const useCalculatedMaxVoterWeight = (args: Args): BN | null => {
    const [weight, setWeight] = useState<BN | null>(null)

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