import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

export const vsrPluginsPks: string[] = [
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo',
]

export const nftPluginsPks: string[] = [
  'FDfF7jzJDCEkFWNi3is487k8rFPJxFkU821t2pQ1vDr1',
]

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
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const currentPluginPk = config?.account.communityVoterWeightAddin

  useEffect(() => {
    if (wallet?.connected) {
      handleSetVsrClient(wallet, connection)
      handleSetNftClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected, realm?.pubkey.toBase58()])

  useEffect(() => {
    if (
      vsrClient &&
      currentPluginPk &&
      vsrPluginsPks.includes(currentPluginPk.toBase58())
    ) {
      handleSetVsrRegistrar(vsrClient, realm)
      handleSetCurrentRealmVotingClient({
        client: vsrClient,
        realm,
        walletPk: wallet?.publicKey,
      })
    }
    if (
      nftClient &&
      currentPluginPk &&
      nftPluginsPks.includes(currentPluginPk.toBase58())
    ) {
      handleSetNftRegistrar(nftClient!, realm)
      handleSetCurrentRealmVotingClient({
        client: nftClient,
        realm,
        walletPk: wallet?.publicKey,
      })
    }
  }, [currentPluginPk, vsrClient, nftClient])
}
