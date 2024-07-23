import {VoterWeightPlugins} from "../lib/types";
import {getPlugins} from "../lib/getPlugins";
import {useConnection} from "@solana/wallet-adapter-react";
import {useQuery, UseQueryResult} from "@tanstack/react-query";
import useWalletOnePointOh from "@hooks/useWalletOnePointOh";
import {AnchorProvider, Wallet} from "@coral-xyz/anchor";
import {PublicKey} from "@solana/web3.js";

type Args = {
    realmPublicKey?: PublicKey
    governanceMintPublicKey?: PublicKey
    walletPublicKeys?: PublicKey[]
}

const argsAreSet = (args: Args): args is Required<Args> =>
    args.realmPublicKey !== undefined && args.governanceMintPublicKey !== undefined && args.walletPublicKeys !== undefined

export const usePlugins = (args: Args): UseQueryResult<VoterWeightPlugins, unknown> => {
    const { connection } = useConnection()
    const wallet = useWalletOnePointOh()
    const signer = wallet as unknown as Wallet;
    const provider = wallet && new AnchorProvider(
        connection,
        signer,
        AnchorProvider.defaultOptions()
    )

    const queryKeys = [
        'getPlugins',
        args.realmPublicKey?.toString(),
        args.governanceMintPublicKey?.toString(),
        args.walletPublicKeys?.map(pubkey => pubkey.toString()).join(",")
    ]

    // Cache plugin loading with react-query
    return useQuery<VoterWeightPlugins>(
        queryKeys,
        async () => {
            if (!args.walletPublicKeys || !provider) return {
                voterWeight: [],
                maxVoterWeight: []
            };

            try {
                // Load the voter weight plugins associated with the realm and governance
                const voterWeightPluginsPromise = getPlugins({
                    ...(args as Required<Args>),
                    provider,
                    type: 'voterWeight',
                    wallets: args.walletPublicKeys,
                    signer
                });
                // Load the max voter weight plugins associated with the realm and governance
                const maxVoterWeightPluginsPromise = getPlugins({
                    ...(args as Required<Args>),
                    provider,
                    type: 'maxVoterWeight',
                    wallets: args.walletPublicKeys,
                    signer
                });

                const [voterWeightPlugins, maxVoterWeightPlugins] = await Promise.all([
                    voterWeightPluginsPromise,
                    maxVoterWeightPluginsPromise
                ]);

                return {
                    voterWeight: voterWeightPlugins,
                    maxVoterWeight: maxVoterWeightPlugins
                };
            } catch {
                return {
                    voterWeight: [],
                    maxVoterWeight: []
                };
            }
            
        },
        {
            enabled: argsAreSet(args),
        }
    )
}