import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

export function useVotingPlugins() {
  const { realm } = useRealm()
  const {
    handleSetVsrRegistrar,
    handleSetVsrClient,
    handleSetNftClient,
    handleSetNftRegistrar,
    handleSetCurrentRealmVotingClient,
  } = useVotePluginsClientStore()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)

  useEffect(() => {
    if (wallet?.connected) {
      handleSetVsrClient(wallet, connection)
      handleSetNftClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected, realm?.pubkey])

  useEffect(() => {
    if (realm && client) {
      handleSetVsrRegistrar(client, realm)
    }
    if (realm && nftClient) {
      handleSetNftRegistrar(nftClient, realm)
    }
    if (realm?.account.config.useCommunityVoterWeightAddin) {
      handleSetCurrentRealmVotingClient(client, realm, wallet?.publicKey)
    }
  }, [realm?.pubkey, client, nftClient])
}
