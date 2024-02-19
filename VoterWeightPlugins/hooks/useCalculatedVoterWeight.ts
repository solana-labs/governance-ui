import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import { calculateVoterWeight } from "../lib/calculateVoterWeights";
import {useQuery, UseQueryResult} from "@tanstack/react-query";

type Args = UseVoterWeightPluginsArgs & {
    plugins?: VoterWeightPluginInfo[],
    tokenOwnerRecord?: ProgramAccount<TokenOwnerRecord>
}

// args, where all the necessary properties are marked as required - we can calculate once they are all set
type RequiredArgs = Required<UseVoterWeightPluginsArgs> & {
    plugins: VoterWeightPluginInfo[],
    tokenOwnerRecord?: ProgramAccount<TokenOwnerRecord>
};

const argsAreSet = (args: Args): args is RequiredArgs =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined &&
    args.plugins !== undefined

export const useCalculatedVoterWeight = (args: Args): UseQueryResult<CalculatedWeight> =>
    useQuery(
        [
            'calculateVoterWeight',
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.walletPublicKey?.toString(),
            args.tokenOwnerRecord?.pubkey.toString()
        ],
        () => calculateVoterWeight(args as RequiredArgs),
        {
            enabled: argsAreSet(args),
        }
    )