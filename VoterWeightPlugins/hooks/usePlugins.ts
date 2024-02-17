import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../lib/types";
import {getPlugins} from "../lib/getPlugins";
import {useConnection} from "@solana/wallet-adapter-react";
import {queryKeys} from "../lib/utils";
import {useQuery, UseQueryResult} from "@tanstack/react-query";

const argsAreSet = (args: UseVoterWeightPluginsArgs): args is Required<UseVoterWeightPluginsArgs> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined;

export const usePlugins = (args: UseVoterWeightPluginsArgs): UseQueryResult<VoterWeightPluginInfo[], unknown> => {
    const { connection } = useConnection()

    return useQuery(
        ['fetchPlugins', queryKeys(args)],
        () => getPlugins({
            ...(args as Required<UseVoterWeightPluginsArgs>),
            connection,
        }),
        {
            enabled: argsAreSet(args),
        }
    )
}