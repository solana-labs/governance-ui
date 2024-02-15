import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {calculateVoterWeight} from "../lib/calculateVoterWeight";
import {useState} from "react";
import BN from "bn.js";
import queryClient from "@hooks/queries/queryClient";

type Args = UseVoterWeightPluginsArgs & {
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
                args.realmPublicKey.toString(),
                args.governanceMintPublicKey.toString(),
                args.walletPublicKey.toString(),
            ],
            queryFn: () => calculateVoterWeight(args),
        }).then(setWeight);
    }

    return weight;
}