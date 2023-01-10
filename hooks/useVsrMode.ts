import { useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { heliumVsrPluginsPks, vsrPluginsPks } from './useVotingPlugins'

export const useVsrMode = (): undefined | 'default' | 'helium' => {
  const config = useWalletStore((s) => s.selectedRealm.config)
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
