import { Coefficients, DEFAULT_COEFFICIENTS } from 'QuadraticPlugin/sdk/api'
import { usePlugins, usePluginsArgs } from './usePlugins'
import { BN } from '@coral-xyz/anchor'
import { PluginData } from './getPlugins'

// TODO: move to getVotingPlugins when ready
export interface useVotingPluginReturnType {
  isLoading: boolean //defines if the plugin is loading
  isEnabled: boolean //defines if the plugin is enabled in the realm
  pluginData: PluginData //defines the plugin data
}

export interface useQuadraticVotingPluginReturnType
  extends useVotingPluginReturnType {
  setVotingPower: (communityTokenRecordPower: BN) => void
}

export const useQuadraticVotingPlugin = ({
  realmPublicKey,
  governanceMintPublicKey,
  walletPublicKey,
}: usePluginsArgs): useQuadraticVotingPluginReturnType => {
  const {
    isLoading,
    setPluginDataParam,
    getPluginData,
    isPluginEnabled,
  } = usePlugins({
    realmPublicKey,
    governanceMintPublicKey,
    walletPublicKey,
  })

  // note this is not bignumber-safe - TODO use a bigdecimal library to ensure the frontend values match the real ones
  const applyCoefficients = (x: BN, coefficients: Coefficients) => {
    const [a, b, c] = coefficients

    const number = x.toNumber()
    const rootX = Math.sqrt(x.toNumber())

    return new BN(Math.floor(a * rootX + b * number + c))
  }

  const getVotingPower = () => getPluginData('quadraticVoting').votingPower

  const setVotingPower = (communityTokenRecordPower: BN) => {
    const votingPower = applyCoefficients(
      communityTokenRecordPower,
      DEFAULT_COEFFICIENTS
    )

    setPluginDataParam('quadraticVoting', 'votingPower', votingPower)
  }

  return {
    isLoading,
    isEnabled: isPluginEnabled('quadraticVoting'),
    pluginData: getPluginData('quadraticVoting'),
    setVotingPower,
  }
}
