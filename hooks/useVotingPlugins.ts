import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

export const vsrPluginsPks: string[] = [
  '11111111FdN3kLpJtMtdLync3ERGTM15wsHGvjc99',
  '11111111FdN3kLpJtMtdLync3ERGTM15wsHGvjc95',
  '11111111FdN3kLpJtMtdLync3ERGTM15wsHGvjc9H',
]

export const nftPluginsPks: string[] = []

export function useVotingPlugins() {
  const { realm, config } = useRealm()
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
  const currentPluginPk = config?.account?.communityVoterWeightAddin
  useEffect(() => {
    if (wallet?.connected) {
      handleSetVsrClient(wallet, connection)
      handleSetNftClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected, realm?.pubkey.toBase58()])

  useEffect(() => {
    if (realm && client) {
      handleSetVsrRegistrar(client, realm)
    }
    if (realm && nftClient) {
      handleSetNftRegistrar(nftClient, realm)
    }
    if (currentPluginPk && vsrPluginsPks.includes(currentPluginPk.toBase58())) {
      handleSetCurrentRealmVotingClient({
        client,
        realm,
        walletPk: wallet?.publicKey,
      })
    }
    if (currentPluginPk && nftPluginsPks.includes(currentPluginPk.toBase58())) {
      handleSetCurrentRealmVotingClient({
        client: undefined,
        realm: undefined,
        walletPk: undefined,
      })
    }
  }, [currentPluginPk, client, nftClient])
}
