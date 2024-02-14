import {UsePluginsReturnType} from "../../useVoterWeightPlugins";
import {UseVoterWeightPluginsArgs} from "../../types";

export const useNftVoterWeight = (args: UseVoterWeightPluginsArgs): UsePluginsReturnType | undefined => {
    // TODO dummy
    console.log(args);
    return {
        isReady: false,
        plugins:undefined,
        updateVoterWeightRecords: async () => [],
        createVoterWeightRecords: async () => [],
        updateMaxVoterWeightRecords: async () => [],
        createMaxVoterWeightRecords: async () => [],
        voterWeight: null,
        maxVoterWeight: null
    }
}