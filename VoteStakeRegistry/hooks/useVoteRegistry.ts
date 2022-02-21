import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'

export function useVoteRegistry() {
  const { realm } = useRealm()
  const {
    handleSetRegistrar,
    handleSetClient,
  } = useVoteStakeRegistryClientStore()
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)

  useEffect(() => {
    if (wallet?.connected) {
      handleSetClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected, realm?.pubkey])

  useEffect(() => {
    if (realm && client) {
      handleSetRegistrar(client, realm)
    }
  }, [realm?.pubkey, client])
}
