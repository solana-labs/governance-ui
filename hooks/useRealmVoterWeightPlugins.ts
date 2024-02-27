// Exposes a 'realms-friendly' version of the generic useVoterWeightPlugins hook,
// which knows how to get the current realm, governance mint, and wallet public keys
// this simplifies usage across the realms codebase
import {useVoterWeightPlugins} from "../VoterWeightPlugins";
import {useRealmQuery} from "@hooks/queries/realm";
import useWalletOnePointOh from "@hooks/useWalletOnePointOh";
import {GovernanceRole} from "../@types/types";
import {useSelectedDelegatorStore} from "../stores/useSelectedDelegatorStore";

export const useRealmVoterWeightPlugins = (role : GovernanceRole = 'community') => {
    const realm = useRealmQuery().data?.result
    const wallet = useWalletOnePointOh()
    const governanceMintPublicKey =
        role === 'community'
            ? realm?.account.communityMint
            : realm?.account.config.councilMint
    const selectedDelegator = useSelectedDelegatorStore((s) =>
        role === 'community' ? s.communityDelegator : s.councilDelegator
    )

    // if a delegator is selected, use it, otherwise use the currently connected wallet
    return useVoterWeightPlugins({
        realmPublicKey: realm?.pubkey,
        governanceMintPublicKey,
        walletPublicKey: selectedDelegator ?? wallet?.publicKey ?? undefined
    })
}

// Get the current weights for the community and council governances - should be used in cases where the realm is known but the choice of governance is not,
// e.g. when creating a proposal
export const useRealmVoterWeights = () => {
    const { calculatedMaxVoterWeight: communityMaxWeight, calculatedVoterWeight: communityWeight } = useRealmVoterWeightPlugins('community')
    const { calculatedMaxVoterWeight: councilMaxWeight, calculatedVoterWeight: councilWeight } = useRealmVoterWeightPlugins('council')

    return {
        communityMaxWeight,
        communityWeight,
        councilMaxWeight,
        councilWeight
    }
}