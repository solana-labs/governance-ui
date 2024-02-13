// Exposes a 'realms-friendly' version of the generic useVoterWeightPlugins hook,
// which knows how to get the current realm, governance mint, and wallet public keys
// this simplifies usage across the realms codebase
import {useVoterWeightPlugins} from "../VoterWeightPlugins";
import {useRealmQuery} from "@hooks/queries/realm";
import useWalletOnePointOh from "@hooks/useWalletOnePointOh";

export const useRealmVoterWeightPlugins = (kind : 'community' | 'council' = 'community') => {
    const realm = useRealmQuery().data?.result
    const wallet = useWalletOnePointOh()
    const governanceMintPublicKey =
        kind === 'community'
            ? realm?.account.communityMint
            : realm?.account.config.councilMint
    return useVoterWeightPlugins({
        realmPublicKey: realm?.pubkey,
        governanceMintPublicKey,
        walletPublicKey: wallet?.publicKey ?? undefined
    })
}