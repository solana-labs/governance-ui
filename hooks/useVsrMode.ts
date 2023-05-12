import { useMemo } from 'react'
import { heliumVsrPluginsPks, vsrPluginsPks } from './useVotingPlugins'
import { useRealmConfigQuery } from './queries/realmConfig'

export const useVsrMode = (): undefined | 'default' | 'helium' => {
  const config = useRealmConfigQuery().data?.result
  const mode = useMemo(() => {
    const currentPluginPk =
      config?.account?.communityTokenConfig.voterWeightAddin
    if (!currentPluginPk) return undefined
    if (vsrPluginsPks.includes(currentPluginPk?.toBase58())) return 'default'
    if (heliumVsrPluginsPks.includes(currentPluginPk?.toBase58()))
      return 'helium'
  }, [config?.account?.communityTokenConfig])

  return mode
}
