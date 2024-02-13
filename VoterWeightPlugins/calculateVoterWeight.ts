import { BN } from '@coral-xyz/anchor'
import {VoterWeightPluginInfo} from "./types";

export const calculateVoterWeight = (
  plugins: VoterWeightPluginInfo[]
): BN => {
  // let voteWeight
  // // plugins are sorted in newest plugin > oldest, but we want to operate on the oldest first
  // const reversedPlugins = plugins.reverse()
  //
  //
  // reversedPlugins.forEach((plugin) => {
  //   voteWeight = plugin.voterWeight
  // })

// Currently we are just showing the latest values in the voter weight records - TODO calculate the latest value
  return plugins[plugins.length - 1].voterWeight
}
