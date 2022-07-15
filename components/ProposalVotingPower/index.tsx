import classNames from 'classnames'

import useWalletStore from 'stores/useWalletStore'
import {
  gatewayPluginsPks,
  switchboardPluginsPks,
} from '@hooks/useVotingPlugins'
import TokenBalanceCardWrapper from '@components/TokenBalance/TokenBalanceCardWrapper'
import useRealm from '@hooks/useRealm'
import useProposal from '@hooks/useProposal'
import { option } from '@tools/core/option'

import VotingPower from './VotingPower'

interface Props {
  className?: string
}

export default function ProposalVotingPower(props: Props) {
  const connected = !!useWalletStore((s) => s.current?.connected)
  const { config } = useRealm()
  const { proposal } = useProposal()

  const currentPluginPk = config?.account?.communityVoterWeightAddin

  const isUsingGatewayPlugin =
    currentPluginPk && gatewayPluginsPks.includes(currentPluginPk.toBase58())

  const isUsingSwitchboardPlugin =
    currentPluginPk &&
    switchboardPluginsPks.includes(currentPluginPk.toBase58())

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
