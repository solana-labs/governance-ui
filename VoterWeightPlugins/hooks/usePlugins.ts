import {VoterWeightPlugins} from "../lib/types";
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

export const usePlugins = (args: Args): UseQueryResult<VoterWeightPlugins, unknown> => {
    const { connection } = useConnection()
    const wallet = useWalletOnePointOh()
    const provider = wallet && new AnchorProvider(
        connection,
        wallet as unknown as Wallet,
        AnchorProvider.defaultOptions()
    )

    // Cache plugin loading with react-query
    return useQuery<VoterWeightPlugins>(
        ['getPlugins', ...queryKeys(args), wallet?.publicKey?.toString()],
        async () => {
            if (!provider || !provider.publicKey) return {
                voterWeight: [],
                maxVoterWeight: []
            };
            // Load the voter weight plugins associated with the realm and governance
            const voterWeightPluginsPromise = getPlugins({
                ...(args as Required<Args>),
                provider,
                type: 'voterWeight'
            });
            // Load the max voter weight plugins associated with the realm and governance
            const maxVoterWeightPluginsPromise = getPlugins({
                ...(args as Required<Args>),
                provider,
                type: 'maxVoterWeight'
            });

            const [voterWeightPlugins, maxVoterWeightPlugins] = await Promise.all([
                voterWeightPluginsPromise,
                maxVoterWeightPluginsPromise
            ]);

            return {
                voterWeight: voterWeightPlugins,
                maxVoterWeight: maxVoterWeightPlugins
            };
        },
        {
            enabled: argsAreSet(args) && !!provider?.publicKey,
        }
    )
}