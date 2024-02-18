import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";
import {useRealmQuery} from "@hooks/queries/realm";
import useWalletOnePointOh from "@hooks/useWalletOnePointOh";
import {VotingClient} from "@utils/uiTypes/VotePlugin";

export const useVotingClient = (kind: 'community' | 'council' = 'community') => {
    const voterWeightPluginDetails = useRealmVoterWeightPlugins(kind);
    const realm = useRealmQuery().data?.result
    const wallet = useWalletOnePointOh()

    // messy logic to get the "legacy" client out of the plugins.
    // if there's more than one, use the first one.
    // this only works if the legacy plugins don't support chaining anyway.
    // if they did, then we would have to call relinquish on whichever plugin supported it
    const client = voterWeightPluginDetails.plugins?.length ? voterWeightPluginDetails.plugins[0].client : undefined

    // TODO react-query?

    return new VotingClient({
        client: client,
        realm: realm,
        walletPk: wallet?.publicKey,
        voterWeightPluginDetails
    });
}