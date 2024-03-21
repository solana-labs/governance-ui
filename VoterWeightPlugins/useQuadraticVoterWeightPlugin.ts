import { QV_PLUGINS_PKS } from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import {useVoterWeightPluginReadinessReturnType} from "./lib/types";

export interface useQuadraticVoterWeightPluginReturnType
  extends useVoterWeightPluginReadinessReturnType {
  coefficients: Coefficients
}

export type Coefficients = [a: number, b: number, c: number]

type QuadraticPluginParams = {
  coefficients: Coefficients
}

export const useQuadraticVoterWeightPlugin = (): useQuadraticVoterWeightPluginReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const quadraticPlugin = plugins?.voterWeight.find((plugin) =>
    QV_PLUGINS_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = quadraticPlugin !== undefined
  const coefficients = (
    (quadraticPlugin?.params as QuadraticPluginParams) || undefined
  )?.coefficients

  return {
    isReady,
    coefficients,
    isEnabled,
  }
}
