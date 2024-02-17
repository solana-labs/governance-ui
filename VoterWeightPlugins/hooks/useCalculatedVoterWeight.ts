import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import { calculateVoterWeight } from "../lib/calculateVoterWeights";
import {useQuery, UseQueryResult} from "@tanstack/react-query";

type Args = UseVoterWeightPluginsArgs & {
    plugins?: VoterWeightPluginInfo[],
    tokenOwnerRecord?: ProgramAccount<TokenOwnerRecord>
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined &&
    args.plugins !== undefined && args.tokenOwnerRecord !== undefined

export const useCalculatedVoterWeight = (args: Args): UseQueryResult<CalculatedWeight> =>
    useQuery(
        [
            'calculateVoterWeight',
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.walletPublicKey?.toString(),
        ],
        () => calculateVoterWeight(args as Required<Args>),
        {
            enabled: argsAreSet(args),
        }
    )