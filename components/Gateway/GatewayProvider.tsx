import { FC } from 'react'
import { GatewayProvider as InternalGatewayProvider } from '@civic/solana-gateway-react'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useGatewayVoterWeightPlugin } from 'VoterWeightPlugins'
import { useConnection } from '@solana/wallet-adapter-react'
import {getNetworkFromEndpoint} from "@utils/connection";

/**
 * Wrapper for the Civic Gateway Provider react component. This component is responsible for
 * a) finding a gateway token for a given wallet and gatekeeper network (the "type" of gateway token)
 * b) opening an iFrame to allow the user to obtain a gateway token of the required type
 * @param children
 * @constructor
 */
export const GatewayProvider: FC = ({ children }) => {
  const wallet = useWalletOnePointOh()
  const { gatekeeperNetwork, isReady } = useGatewayVoterWeightPlugin()
  const { connection } = useConnection()
    const network = getNetworkFromEndpoint(connection.rpcEndpoint);
    const cluster = network === 'mainnet'
      ? 'mainnet-beta'
      : network

  if (!wallet || !wallet.publicKey || !isReady || !gatekeeperNetwork)
    return <>{children}</>

  return (
    <InternalGatewayProvider
      connection={connection}
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
