/*
This hook encapsulates all voter weight plugins that Realms already knows about.
These plugins already use their own bespoke hooks to calculate voter weights, etc.
In  order to integrate them with a generic voter weight plugin hook, they need to be
marshalled into a common interface. This is the purpose of this hook.
 */
import {UseVoterWeightPluginsArgs} from "../lib/types";
import {UsePluginsReturnType} from "../useVoterWeightPlugins";
import {useNftVoterWeight} from "./builtins/useNftVoterWeight";

export const useBuiltInPlugins = (args: UseVoterWeightPluginsArgs): UsePluginsReturnType | undefined => {
    const nftVoterInfo = useNftVoterWeight(args);
    // TODO Others

    return nftVoterInfo;
}