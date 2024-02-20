import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {calculateMaxVoterWeight} from "../lib/calculateVoterWeights";
import {MintInfo} from "@solana/spl-token";
import {useQuery, UseQueryResult} from "@tanstack/react-query";

type Args = Omit<UseVoterWeightPluginsArgs, 'walletPublicKey'> & {
    plugins?: VoterWeightPluginInfo[],
    mintInfo?: MintInfo
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined &&
    args.plugins !== undefined && args.mintInfo !== undefined

export const useCalculatedMaxVoterWeight = (args: Args): UseQueryResult<CalculatedWeight, unknown> =>
    useQuery(
        [
            'calculateMaxVoterWeight',
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.mintInfo
        ],
        () => calculateMaxVoterWeight(args as Required<Args>),
        {
            enabled: argsAreSet(args), // This will prevent the query from automatically running if args aren't set
        }
    )
