import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

export function useVoteRegistry() {
  const { realm } = useRealm()
  const {
    handleSetRegistrar,
    handleSetClient,
    handleSetNftClient,
    handleSetNftRegistrar,
  } = useVotePluginsClientStore()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const client = useVotePluginsClientStore((s) => s.state.client)
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)

  useEffect(() => {
    if (wallet?.connected) {
      handleSetClient(wallet, connection)
      handleSetNftClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected, realm?.pubkey])

  useEffect(() => {
    if (realm && client) {
      handleSetRegistrar(client, realm)
    }
    if (realm && nftClient) {
      handleSetNftRegistrar(nftClient, realm)
    }
  }, [realm?.pubkey, client])
}
