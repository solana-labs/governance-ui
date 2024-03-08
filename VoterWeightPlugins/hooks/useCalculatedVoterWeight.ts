import { ProgramAccount, TokenOwnerRecord } from "@solana/spl-governance";
import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import { calculateVoterWeight } from "../lib/calculateVoterWeights";
import {useAsync, UseAsyncReturn} from "react-async-hook";

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

export const useCalculatedVoterWeight = (args: Args) : UseAsyncReturn<CalculatedWeight | undefined> =>
    useAsync(
        async () => {
            console.log('useCalculatedVoterWeight')
            if (!argsAreSet(args)) {
                console.log('useCalculatedVoterWeight not calling because args are not set', args);
                return undefined;
            }
            console.log('useCalculatedVoterWeight calling')
            const calculatedWeightPromise = calculateVoterWeight(args as RequiredArgs);
            calculatedWeightPromise.then((result) => console.log('useCalculatedVoterWeight result', result.value?.toString()))
            return calculatedWeightPromise;
        },
        [
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.walletPublicKey?.toString(),
            args.tokenOwnerRecord?.pubkey.toString()
        ],
        // {
        //
        // }
    )