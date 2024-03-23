import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {calculateMaxVoterWeight} from "../lib/calculateVoterWeights";
import {MintInfo} from "@solana/spl-token";
import {useAsync, UseAsyncReturn} from "react-async-hook";

type Args = Omit<UseVoterWeightPluginsArgs, 'walletPublicKey'> & {
    plugins?: VoterWeightPluginInfo[],
    mintInfo?: MintInfo
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined &&
    args.plugins !== undefined && args.mintInfo !== undefined

export const useCalculatedMaxVoterWeight = (args: Args): UseAsyncReturn<CalculatedWeight | undefined> =>
    useAsync(
        async () => {
            if (!argsAreSet(args)) return undefined;
            return calculateMaxVoterWeight(args as Required<Args>);
        },
        [
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.mintInfo,
            args.plugins?.length
        ],
    )
