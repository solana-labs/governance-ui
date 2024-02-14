import {UseVoterWeightPluginsArgs, VoterWeightPluginInfo} from "../types";
import {useState} from "react";
import queryClient from "@hooks/queries/queryClient";
import {getPlugins} from "../getPlugins";
import {useConnection} from "@solana/wallet-adapter-react";
import {queryKeys} from "../utils";

const argsAreSet = (args: UseVoterWeightPluginsArgs): args is Required<UseVoterWeightPluginsArgs> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKey !== undefined;

export const usePlugins = (args: UseVoterWeightPluginsArgs): VoterWeightPluginInfo[] | undefined => {
    const { connection } = useConnection()
    const [plugins, setPlugins] = useState<VoterWeightPluginInfo[]>()

    if (argsAreSet(args)) {
        queryClient.fetchQuery({
            queryKey: ['fetchPlugins', queryKeys(args)],
            queryFn: () =>
                getPlugins({
                    ...args,
                    connection,
                }),
        }).then(setPlugins);
    }

    return plugins;
}