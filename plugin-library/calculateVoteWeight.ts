import { BN } from '@coral-xyz/anchor'
import { PluginData } from './getPlugins'

export const calculateVoteWeight = async (
  plugins: Array<PluginData>
): Promise<BN | null> => {
  let voteWeight
  // plugins are sorted in newest plugin > oldest, but we want to operate on the oldest first
  const reversedPlugins = plugins.reverse()

  // Calculate vote weight here?
  reversedPlugins.forEach(async (plugin) => {
    voteWeight = plugin.voterWeight
  })

  return voteWeight
}
