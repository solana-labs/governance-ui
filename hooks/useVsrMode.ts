import { useMemo } from 'react'
import { HELIUM_VSR_PLUGINS_PKS, VSR_PLUGIN_PKS } from '../constants/plugins'
import { useRealmConfigQuery } from './queries/realmConfig'

export const useVsrMode = (): undefined | 'default' | 'helium' => {
  const config = useRealmConfigQuery().data?.result
  const mode = useMemo(() => {
    const currentPluginPk =
      config?.account?.communityTokenConfig.voterWeightAddin
    if (!currentPluginPk) return undefined
    if (VSR_PLUGIN_PKS.includes(currentPluginPk?.toBase58())) return 'default'
    if (HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk?.toBase58()))
      return 'helium'
  }, [config?.account?.communityTokenConfig])

  return mode
}
