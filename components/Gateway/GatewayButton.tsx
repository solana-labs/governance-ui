import { IdentityButton, useGateway } from '@civic/solana-gateway-react'
import { FC, useEffect } from 'react'
import useGatewayPluginStore from '../../GatewayPlugin/store/gatewayPluginStore'
import useVotePluginsClientStore from '../../stores/useVotePluginsClientStore'

export const GatewayButton: FC = () => {
  const { setGatewayToken, state } = useGatewayPluginStore()
  const currentClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )

  const { gatewayToken } = useGateway()

  // As soon as the Civic GatewayProvider finds a gateway token
  // add it to the state, so that the voting plugin can use it
  useEffect(() => {
    if (
      gatewayToken &&
      state.gatewayToken?.toBase58() !== gatewayToken.publicKey.toBase58()
    ) {
      setGatewayToken(gatewayToken.publicKey, currentClient)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [gatewayToken])

  return (
    <IdentityButton className="gatewayButton !w-1/2 default-transition !font-bold !px-4 !rounded-full !py-2.5 !text-sm focus:!outline-none !bg-primary-light !text-bkg-2 hover:!bg-primary-dark" />
  )
}
