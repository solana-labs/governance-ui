import {VoterWeightPluginInfo} from "../lib/types";
import {getPlugins} from "../lib/getPlugins";
import {useConnection} from "@solana/wallet-adapter-react";
import {queryKeys} from "../lib/utils";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import useWalletOnePointOh from "@hooks/useWalletOnePointOh";
import {AnchorProvider, Wallet} from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";

type Args = {
    realmPublicKey?: PublicKey
    governanceMintPublicKey?: PublicKey
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined;

export const usePlugins = (args: Args): UseQueryResult<VoterWeightPluginInfo[], unknown> => {
    const { connection } = useConnection()
    const wallet = useWalletOnePointOh()
    const provider = wallet && new AnchorProvider(
        connection,
        wallet as unknown as Wallet,
        AnchorProvider.defaultOptions()
    )

    return useQuery(
        ['getPlugins', ...queryKeys(args), wallet?.publicKey?.toString()],
        () => {
            if (!provider) return [];
            return getPlugins({
                ...(args as Required<Args>),
                provider,
            });
        },
        {
            enabled: argsAreSet(args) && !!provider,
        }
    )
}