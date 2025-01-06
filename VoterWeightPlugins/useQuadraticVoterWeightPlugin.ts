import { QV_PLUGINS_PKS } from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'

import { useVoterWeightPluginReadinessReturnType } from './lib/types'

export interface useQuadraticVoterWeightPluginReturnType
  extends useVoterWeightPluginReadinessReturnType {
  coefficients: Coefficients
}

export type Coefficients = [a: number, b: number, c: number]

export type QuadraticPluginParams = {
  quadraticCoefficients: Coefficients
}

export const useQuadraticVoterWeightPlugin = (): useQuadraticVoterWeightPluginReturnType => {
  const { isReady, plugins } = useRealmVoterWeightPlugins()

  const quadraticPlugin = plugins?.voterWeight.find((plugin) =>
    QV_PLUGINS_PKS.includes(plugin.programId.toString())
  )

  const isEnabled = quadraticPlugin !== undefined
  const coefficients = (
    (quadraticPlugin?.params as QuadraticPluginParams) || undefined
  )?.quadraticCoefficients

  return {
    isReady,
    coefficients,
    isEnabled,
  }
}
