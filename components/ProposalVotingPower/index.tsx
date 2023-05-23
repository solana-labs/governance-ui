import classNames from 'classnames'

import useWalletStore from 'stores/useWalletStore'
import {
  GATEWAY_PLUGINS_PKS,
  SWITCHBOARD_PLUGINS_PKS,
} from '@constants/plugins'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import { option } from '@tools/core/option'

import VotingPower from './VotingPower'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { useRouteProposalQuery } from '@hooks/queries/proposal'

interface Props {
  className?: string
}

export default function ProposalVotingPower(props: Props) {
  const connected = !!useWalletStore((s) => s.current?.connected)
  const config = useRealmConfigQuery().data?.result
  const proposal = useRouteProposalQuery().data?.result
  const currentPluginPk = config?.account?.communityTokenConfig.voterWeightAddin

  const isUsingGatewayPlugin =
    currentPluginPk && GATEWAY_PLUGINS_PKS.includes(currentPluginPk.toBase58())

  const isUsingSwitchboardPlugin =
    currentPluginPk &&
    SWITCHBOARD_PLUGINS_PKS.includes(currentPluginPk.toBase58())

  if (isUsingGatewayPlugin || isUsingSwitchboardPlugin) {
    return <TokenBalanceCardWrapper proposal={option(proposal?.account)} />
  }

  return (
    <div
      className={classNames(
        props.className,
        'bg-bkg-2',
        'p-4',
        'rounded-lg',
        'space-y-4',
        'md:p-6'
      )}
    >
      <h3 className="mb-3">My voting power</h3>
      {connected ? (
        <VotingPower />
      ) : (
        <div className="text-xs text-white/50">
          You must connect your wallet to
          <br />
          view your voting power
        </div>
      )}
    </div>
  )
}
