import { FC, ReactNode } from 'react'
import { PluginName } from '@constants/plugins'
import { useRealmVoterWeightPlugins } from '@hooks/useRealmVoterWeightPlugins'
import PythVotingPower from '../../../PythVotePlugin/components/PythVotingPower'
import GatewayCard from '@components/Gateway/GatewayCard'
import NftVotingPower from '@components/ProposalVotingPower/NftVotingPower'
import LockedCommunityNFTRecordVotingPower from '@components/ProposalVotingPower/LockedCommunityNFTRecordVotingPower'
import QuadraticVotingPower from '@components/ProposalVotingPower/QuadraticVotingPower'
import { VSRCard } from '@components/GovernancePower/Power/VSRCard'
import { VanillaCard } from '@components/GovernancePower/Power/Vanilla/VanillaCard'
import DriftVotingPower from 'DriftStakeVoterPlugin/components/DriftVotingPower'
import TokenHaverVotingPower from '@components/ProposalVotingPower/TokenHaverVotingPower'
import ParclVotingPower from 'ParclVotePlugin/components/ParclVotingPower'

/****
 * Note to plugin implementors.
 *
 * To add a plugin with a dedicated Vote Power UI, add the plugin name to the `pluginsWithDedicatedVotingPowerUI` list below.
 * Then register the dedicated UI in CardForPlugin
 *
 ***/

// A list of all the plugins that have a dedicated voting power UI in realms.
// Plugins will use the vanilla voting power UI if they are not in this list.
// The vanilla voting power UI will:
// - assume the user can "deposit" tokens into the DAO
// - show the votes simply using the plucin's calculatedVoteWeight without explanation
// This is a reasonable placeholder for some plugins, but to make life easier for users,
// plugin developers may want to add their own.
const pluginsWithDedicatedVotingPowerUI = [
  'NFT',
  'pyth',
  'HeliumVSR',
  'VSR',
  'gateway',
  'QV',
  'drift',
  'token_haver',
  "parcl"
] as const

export type VotingCardProps = {
  role: 'community' | 'council'
  hideIfZero?: boolean
  className?: string
}

// True if the plugin has a dedicated voting power UI
// The type assertion here does the following:
// - pass any plugin name
// - narrow the type to a plugin that requires a dedicated UI
// - adding to the pluginsWithDedicatedVotingPowerUI list forces the CardForPlugin component to be updated
const hasDedicatedVotingPowerUI = (
  plugin: PluginName
): plugin is typeof pluginsWithDedicatedVotingPowerUI[number] =>
  pluginsWithDedicatedVotingPowerUI.includes(
    plugin as typeof pluginsWithDedicatedVotingPowerUI[number]
  )

const CardForPlugin: FC<
  { plugin: typeof pluginsWithDedicatedVotingPowerUI[number] } & VotingCardProps
> = ({ plugin, role, ...props }) => {
  switch (plugin) {
    case 'NFT':
      return <NftVotingPower />
    case 'pyth':
      return <PythVotingPower role={role} />
    case 'HeliumVSR':
      return <LockedCommunityNFTRecordVotingPower />
    case 'VSR':
      return <VSRCard role={role} {...props} />
    case 'gateway':
      return <GatewayCard role={role} />
    case 'QV':
      return <QuadraticVotingPower role={role} />
    case 'drift':
      return <DriftVotingPower role={role} />
    case 'token_haver':
      return <TokenHaverVotingPower role={role} />
    case 'parcl':
      return <ParclVotingPower role={role} />
  }
}

/**
 * A component that renders the voting power cards for a given set of plugins.
 *
 * NOTE: This applies only to the community role at present, as practically plugins are only applied to community
 * governances. However, there is little reason why this could not be extended to the council role, so to ensure
 * future-compatibility we are passing the role here.
 */
export const VotingPowerCards: FC<VotingCardProps> = (props) => {
  const { plugins } = useRealmVoterWeightPlugins(props.role)
  const cards = (plugins?.voterWeight ?? [])
    .map((plugin, pluginIdx): ReactNode | undefined => {
      return hasDedicatedVotingPowerUI(plugin.name) ? (
        <CardForPlugin plugin={plugin.name} {...props} key={pluginIdx} />
      ) : undefined
    })
    .filter(Boolean) // filter out undefined

  const includesUnrecognizedPlugin = plugins?.voterWeight.some(
    (plugin) => plugin.name === 'unknown'
  )

  if (!cards.length) {
    // No dedicated plugin cards - add the vanilla card
    cards.push(
      <VanillaCard unrecognizedPlugin={includesUnrecognizedPlugin} {...props} />
    )
  }

  return <>{cards}</>
}
