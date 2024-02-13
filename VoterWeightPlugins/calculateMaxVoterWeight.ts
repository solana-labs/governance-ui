import { BN } from '@coral-xyz/anchor'
import {VoterWeightPluginInfo} from "./types";

export const calculateMaxVoterWeight = (
  plugins: VoterWeightPluginInfo[]
): BN | undefined => {
  // let voteWeight
  // // plugins are sorted in newest plugin > oldest, but we want to operate on the oldest first
  // const reversedPlugins = plugins.reverse()
  //
  //
  // reversedPlugins.forEach((plugin) => {
  //   voteWeight = plugin.voterWeight
  // })

// Currently we are just showing the latest values in the voter weight records - TODO calculate the latest value
  // Also, this may return undefined, when it should return the max voter weight of the last plugin with a value (or the default voter weight)
  return plugins[plugins.length - 1].maxVoterWeight
}
