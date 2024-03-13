import {ProgramAccount, TokenOwnerRecord} from "@solana/spl-governance";
import {CalculatedWeight, UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {calculateVoterWeight} from "../lib/calculateVoterWeights";
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
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKeys !== undefined &&
    args.plugins !== undefined

export const useCalculatedVoterWeights = (args: Args) : UseAsyncReturn<CalculatedWeight[] | undefined> =>
    useAsync(
        async () => {
            if (!argsAreSet(args)) return undefined;
            const voterWeights = args.walletPublicKeys?.map(wallet => calculateVoterWeight({
                ...args as RequiredArgs,
                walletPublicKey: wallet
            }));
            return Promise.all(voterWeights);
        },
        [
            args.realmPublicKey?.toString(),
            args.governanceMintPublicKey?.toString(),
            args.walletPublicKeys?.map(pubkey => pubkey.toString()).join(","),
            args.tokenOwnerRecord?.pubkey.toString(),
            args.plugins?.length
        ]
    )