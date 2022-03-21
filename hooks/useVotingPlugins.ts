import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getNfts } from '@utils/tokens'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
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
  const { setVotingNfts } = useNftPluginStore()

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const currentClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const currentPluginPk = config?.account.communityVoterWeightAddin
  const nftMintRegistrar = useVotePluginsClientStore(
    (s) => s.state.nftMintRegistrar
  )
  const usedCollectionsPks: string[] =
    nftMintRegistrar?.collectionConfigs.map((x) => x.collection.toBase58()) ||
    []

  const handleGetNfts = async () => {
    const nfts = await getNfts(connection.current, wallet!.publicKey!)
    const votingNfts = (
      await Promise.all(
        nfts.map((x) => getIsFromCollection(x.mint, x.tokenAddress))
      )
    ).filter((x) => x) as { metadata: Metadata; tokenAddress: PublicKey }[]
    const nftsWithMeta = votingNfts.map((x) => {
      const nft = nfts.find(
        (nft) => nft.tokenAddress === x.tokenAddress.toBase58()
      )
      return {
        ...nft!,
        metadata: x.metadata,
      }
    })
    setVotingNfts(nftsWithMeta, currentClient)
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
    if (connected) {
      handleSetVsrClient(wallet, connection)
      handleSetNftClient(wallet, connection)
    }
  }, [connection.endpoint, connected, realm?.pubkey.toBase58()])

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
  }, [currentPluginPk, vsrClient, nftClient, connected])
  useEffect(() => {
    if (usedCollectionsPks.length && connected) {
      handleGetNfts()
    } else {
      setVotingNfts([], currentClient)
    }
  }, [JSON.stringify(usedCollectionsPks), currentClient.client])
}
