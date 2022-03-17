import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { NftVoterClient } from '@solana/governance-program-library'
import { getNfts } from '@utils/tokens'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
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
  const currentClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const currentPluginPk = config?.account.communityVoterWeightAddin
  const nftMintRegistrar = useVotePluginsClientStore(
    (s) => s.state.nftMintRegistrar
  )
  const usedCollectionsPks =
    nftMintRegistrar?.collectionConfigs.map((x) => x.collection.toBase58()) ||
    []
  const handleGetNfts = async () => {
    let nfts = await getNfts(connection.current, wallet!.publicKey!)
    console.log(nfts, '@#$@#$#$@$@#$')
    if (usedCollectionsPks.length) {
      const resp = (
        await Promise.all(
          nfts.map((x) => getIsFromCollection(x.mint, x.tokenAddress))
        )
      ).filter((x) => x) as { metadata: Metadata; tokenAddress: PublicKey }[]
      nfts = nfts.filter((x) =>
        resp.find((j) => j.tokenAddress.toBase58() === x.tokenAddress)
      )
      currentClient._setCurrentVoterNftsAccounts(resp)
    }
    currentClient._setCurrentVoterNfts(nfts)
  }
  const getIsFromCollection = async (mint: string, tokenAddress: string) => {
    const metadataAccount = await Metadata.getPDA(mint)
    const metadata = await Metadata.load(connection.current, metadataAccount)
    return (
      !!(
        metadata.data.collection?.key &&
        usedCollectionsPks.includes(metadata.data.collection?.key) &&
        metadata.data.collection.verified
      ) && {
        tokenAddress: new PublicKey(tokenAddress),
        metadata: metadata as Metadata,
      }
    )
  }
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
  useEffect(() => {
    if (currentClient.client instanceof NftVoterClient && wallet?.connected) {
      handleGetNfts()
    } else {
      currentClient?._setCurrentVoterNfts([])
      currentClient?._setCurrentVoterNftsAccounts([])
    }
  }, [wallet?.connected, currentClient])
}
