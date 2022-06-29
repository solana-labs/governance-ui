import { FC } from 'react'
import { Transaction } from '@solana/web3.js'
import { sendTransaction } from '@utils/send'
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

  // This signs and sends a transaction returned from the gatekeeper (e.g. the pass issuance transaction)
  const handleTransaction = async (transaction: Transaction) => {
    await sendTransaction({
      transaction,
      wallet: wallet!,
      connection: connection.current,
      signers: [],
      sendingMessage: 'Creating pass',
      successMessage: 'Pass created',
    })
  }

  if (!wallet || !wallet.publicKey || !client || !gatekeeperNetwork)
    return <>{children}</>

  return (
    <InternalGatewayProvider
      clusterUrl={connection.endpoint}
      cluster={connection.cluster}
      gatekeeperNetwork={gatekeeperNetwork}
      wallet={{
        publicKey: wallet.publicKey,
        signTransaction: wallet.signTransaction.bind(wallet),
      }}
      handleTransaction={handleTransaction}
    >
      {children}
    </InternalGatewayProvider>
  )
}
