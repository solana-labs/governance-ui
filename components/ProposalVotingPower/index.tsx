import classNames from 'classnames'

import VotingPower from './VotingPower'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

interface Props {
  className?: string
}

export default function ProposalVotingPower(props: Props) {
  const connected = useWalletOnePointOh()?.connected
  /* 
  const isUsingGatewayPlugin =
    currentPluginPk && GATEWAY_PLUGINS_PKS.includes(currentPluginPk.toBase58())

  if (isUsingGatewayPlugin) {
    return <TokenBalanceCardWrapper proposal={option(proposal?.account)} />
  } */

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
