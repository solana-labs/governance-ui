import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {calculateMaxVoterWeight} from "../lib/calculateVoterWeights";
import {MintInfo} from "@solana/spl-token";
import {useAsync, UseAsyncReturn} from "react-async-hook";
import {useMintConfiguredMaxVoteWeight} from "./useMintConfiguredMaxVoteWeight";

type Args = Omit<UseVoterWeightPluginsArgs, 'walletPublicKey'> & {
    plugins?: VoterWeightPluginInfo[],
    mintInfo?: MintInfo,
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined &&
    args.plugins !== undefined && args.mintInfo !== undefined && args.realmConfig !== undefined;

export const useCalculatedMaxVoterWeight = (args: Args): UseAsyncReturn<CalculatedWeight | undefined> => {
    const configuredMaxVoteWeight = useMintConfiguredMaxVoteWeight(
        args.governanceMintPublicKey,
        args.realmConfig,
        args.mintInfo
    );
    return useAsync(
        async () => {
            if (!argsAreSet(args)) return undefined;
            return calculateMaxVoterWeight({
                ...args as Required<Args>,
                configuredMaxVoteWeight
            });
        },
        [
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.mintInfo,
            args.realmConfig,
            args.plugins?.length
        ],
    );
}
