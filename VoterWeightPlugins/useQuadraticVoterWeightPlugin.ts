import {QV_PLUGINS_PKS} from "@constants/plugins";
import {useRealmVoterWeightPlugins} from "@hooks/useRealmVoterWeightPlugins";

export interface useQuadraticVoterWeightPluginReturnType
  extends useVoterWeightPluginReadinessReturnType {
  coefficients: Coefficients
}

// TODO: move to getVotingPlugins when ready
export interface useVoterWeightPluginReadinessReturnType {
  isReady: boolean //defines if the plugin is loading
  isEnabled: boolean //defines if the plugin is enabled in the realm
}

export type Coefficients = [ a: number, b: number, c: number ];

type QuadraticPluginParams = {
  coefficients: Coefficients
}

export const useQuadraticVoterWeightPlugin = (): useQuadraticVoterWeightPluginReturnType => {
  const {
    voterWeight,
    plugins,
  } = useRealmVoterWeightPlugins()

  const quadraticPlugin = plugins.find((plugin) => QV_PLUGINS_PKS.includes(plugin.programId.toString()));

  const isEnabled = quadraticPlugin !== undefined;
  const isReady = voterWeight !== undefined;
  const coefficients = (quadraticPlugin?.params as QuadraticPluginParams || undefined)?.coefficients;

  return {
    isReady,
    coefficients,
    isEnabled
  }
}
