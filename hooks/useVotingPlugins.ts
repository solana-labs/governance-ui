import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getRealmConfig } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'

const vsrPluginsPks = ['11111111FdN3kLpJtMtdLync3ERGTM15wsHGvjc99']

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
  const [currentPluginPk, setCurrentPluginPk] = useState<PublicKey | null>(null)

  useEffect(() => {
    if (wallet?.connected) {
      handleSetVsrClient(wallet, connection)
      handleSetNftClient(wallet, connection)
    }
  }, [connection.endpoint, wallet?.connected, realm?.pubkey.toBase58()])
  useEffect(() => {
    const handleGetRealmConfig = async () => {
      if (realm?.account.config.useCommunityVoterWeightAddin) {
        const config = await getRealmConfig(connection.current, realm!.pubkey!)
        setCurrentPluginPk(config?.account?.communityVoterWeightAddin || null)
      } else {
        setCurrentPluginPk(null)
      }
    }
    handleGetRealmConfig()
  }, [realm?.pubkey.toBase58()])
  useEffect(() => {
    console.log(currentPluginPk?.toBase58(), '#@$@#432324324432')
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
    if (!currentPluginPk) {
      handleSetCurrentRealmVotingClient({
        client: undefined,
        realm: undefined,
        walletPk: undefined,
      })
    }
  }, [currentPluginPk, client, nftClient])
}
