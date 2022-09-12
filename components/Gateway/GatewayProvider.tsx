import { FC } from 'react'
import { GatewayProvider as InternalGatewayProvider } from '@civic/solana-gateway-react'
import useWalletStore from '../../stores/useWalletStore'
import useVotePluginsClientStore from '../../stores/useVotePluginsClientStore'
import useGatewayPluginStore from '../../GatewayPlugin/store/gatewayPluginStore'

/**
 * Wrapper for the Civic Gateway Provider react component. This component is responsible for
 * a) finding a gateway token for a given wallet and gatekeeper network (the "type" of gateway token)
 * b) opening an iFrame to allow the user to obtain a gateway token of the required type
 * @param children
 * @constructor
 */
export const GatewayProvider: FC = ({ children }) => {
  const wallet = useWalletStore((s) => s.current)
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const gatekeeperNetwork = useGatewayPluginStore(
    (s) => s.state.gatekeeperNetwork
  )
  const connection = useWalletStore((s) => s.connection)
  const cluster =
    connection.cluster === 'mainnet' ? 'mainnet-beta' : connection.cluster

  if (!wallet || !wallet.publicKey || !client || !gatekeeperNetwork)
    return <>{children}</>

  return (
    <InternalGatewayProvider
      clusterUrl={connection.endpoint}
      cluster={cluster}
      gatekeeperNetwork={gatekeeperNetwork}
      wallet={{
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction.bind(wallet),
      }}
    >
      {children}
    </InternalGatewayProvider>
  )
}
