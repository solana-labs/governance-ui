import queryClient from "@hooks/queries/queryClient";
import {getPlugins} from "../../VoterWeightPlugins/lib/getPlugins";
import {AnchorProvider, Idl, IdlAccounts} from "@coral-xyz/anchor";
import EmptyWallet from "@utils/Mango/listingTools";
import {Connection, Keypair, PublicKey} from "@solana/web3.js";
import {fetchRealmByPubkey} from "@hooks/queries/realm";
import {PluginName} from "@constants/plugins";
import {VoterWeightPluginInfo} from "../../VoterWeightPlugins/lib/types";

export const fetchPlugin = async (realmPk: PublicKey, connection: Connection, pluginName: PluginName): Promise<VoterWeightPluginInfo | undefined> => {
    const realm = fetchRealmByPubkey(connection, realmPk)
    const plugins = await queryClient.fetchQuery({
        queryKey: ['getCommunityPluginsWithoutWallet', realmPk.toString()],
        queryFn: async () => {
            const {result} = await realm;
            if (!result) return [];
            return getPlugins({
                realmPublicKey: realmPk,
                governanceMintPublicKey: result.account.communityMint,
                provider: new AnchorProvider(connection, new EmptyWallet(Keypair.generate()), AnchorProvider.defaultOptions()),
            })
        }
    });

    return plugins.find((x) => x.name === pluginName);
}

export const fetchPluginRegistrar = async <T extends Idl>(realmPk: PublicKey, connection: Connection, pluginName: PluginName): Promise<IdlAccounts<T>['registrar'] | undefined> => {
    const plugin = await fetchPlugin(realmPk, connection, pluginName);
    return plugin?.params as IdlAccounts<T>['registrar'] | undefined;
}