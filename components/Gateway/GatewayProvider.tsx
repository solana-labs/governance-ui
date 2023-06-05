import { FC } from 'react'
import { GatewayProvider as InternalGatewayProvider } from '@civic/solana-gateway-react'
import useVotePluginsClientStore from '../../stores/useVotePluginsClientStore'
import useGatewayPluginStore from '../../GatewayPlugin/store/gatewayPluginStore'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

/**
 * Wrapper for the Civic Gateway Provider react component. This component is responsible for
 * a) finding a gateway token for a given wallet and gatekeeper network (the "type" of gateway token)
 * b) opening an iFrame to allow the user to obtain a gateway token of the required type
 * @param children
 * @constructor
 */
export const GatewayProvider: FC = ({ children }) => {
  const wallet = useWalletOnePointOh()
  const client = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const gatekeeperNetwork = useGatewayPluginStore(
    (s) => s.state.gatekeeperNetwork
  )
  const connection = useLegacyConnectionContext()
  const cluster =
    connection.cluster === 'mainnet' ? 'mainnet-beta' : connection.cluster

  if (!wallet || !wallet.publicKey || !client || !gatekeeperNetwork)
    return <>{children}</>

  return (
    <InternalGatewayProvider
      connection={connection.current}
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
