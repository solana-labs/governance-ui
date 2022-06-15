import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
import { getNfts } from '@utils/tokens'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { PublicKey } from '@solana/web3.js'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getMaxVoterWeightRecord } from '@solana/spl-governance'
import { getMaxVoterWeightRecord as getPluginMaxVoterWeightRecord } from '@utils/plugin/accounts'
import { notify } from '@utils/notifications'
import {
  LOCALNET_STAKING_ADDRESS as PYTH_LOCALNET_STAKING_ADDRESS,
  DEVNET_STAKING_ADDRESS as PYTH_DEVNET_STAKING_ADDRESS,
} from 'pyth-staking-api'
import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import { getGatekeeperNetwork } from '../GatewayPlugin/sdk/accounts'
import { useGateway } from '@civic/solana-gateway-react'

export const vsrPluginsPks: string[] = [
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo',
]

export const nftPluginsPks: string[] = [
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
]

export const gatewayPluginsPks: string[] = [
  'Ggatr3wgDLySEwA2qEjt1oiw4BUzp5yMLJyz21919dq6', // v1
  'GgathUhdrCWRHowoRKACjgWhYHfxCEdBi5ViqYN6HVxk', // v2, supporting composition
]

export const pythPluginsPks: string[] = [
  PYTH_LOCALNET_STAKING_ADDRESS.toBase58(),
  PYTH_DEVNET_STAKING_ADDRESS.toBase58(),
]

export function useVotingPlugins() {
  const { realm, config, ownTokenRecord } = useRealm()
  const {
    handleSetVsrRegistrar,
    handleSetVsrClient,
    handleSetNftClient,
    handleSetGatewayClient,
    handleSetNftRegistrar,
    handleSetGatewayRegistrar,
    handleSetPythClient,
    handleSetCurrentRealmVotingClient,
  } = useVotePluginsClientStore()
  const {
    setVotingNfts,
    setMaxVoterWeight,
    setIsLoadingNfts,
  } = useNftPluginStore()
  const {
    setGatewayToken,
    setIsLoadingGatewayToken,
    setGatekeeperNetwork,
  } = useGatewayPluginStore()

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const gatewayClient = useVotePluginsClientStore((s) => s.state.gatewayClient)
  const pythClient = useVotePluginsClientStore((s) => s.state.pythClient)
  const { gatewayToken } = useGateway()

  // As soon as the Civic GatewayProvider finds a gateway token
  // add it to the state, so that the voting plugin can use it
  useEffect(() => {
    if (gatewayToken) {
      setGatewayToken(gatewayToken.publicKey, currentClient)
    }
  }, [gatewayToken])

  const currentClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const currentPluginPk = config?.account.communityVoterWeightAddin
  const nftMintRegistrar = useVotePluginsClientStore(
    (s) => s.state.nftMintRegistrar
  )
  const usedCollectionsPks: string[] =
    (currentPluginPk &&
      nftPluginsPks.includes(currentPluginPk?.toBase58()) &&
      nftMintRegistrar?.collectionConfigs.map((x) =>
        x.collection.toBase58()
      )) ||
    []
  const handleGetNfts = async () => {
    setIsLoadingNfts(true)
    try {
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
      setVotingNfts(nftsWithMeta, currentClient, nftMintRegistrar)
    } catch (e) {
      console.log(e)
      notify({
        message: "Something went wrong can't fetch nfts",
        type: 'error',
      })
    }
    setIsLoadingNfts(false)
  }
  const handleRegisterGatekeeperNetwork = async () => {
    if (realm) {
      setIsLoadingGatewayToken(true)

      try {
        const gatekeeperNetwork = await getGatekeeperNetwork(
          gatewayClient,
          realm
        )

        setGatekeeperNetwork(gatekeeperNetwork)
      } catch (e) {
        console.log(e)
        notify({
          message: 'Error fetching gateway token',
          type: 'error',
        })
      }
      setIsLoadingGatewayToken(false)
    }
  }
  const handleMaxVoterWeight = async () => {
    const { maxVoterWeightRecord } = await getPluginMaxVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      nftClient!.program.programId
    )
    try {
      const existingMaxVoterRecord = await getMaxVoterWeightRecord(
        connection.current,
        maxVoterWeightRecord
      )
      setMaxVoterWeight(existingMaxVoterRecord)
    } catch (e) {
      console.log(e)
      setMaxVoterWeight(null)
    }
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
    handleSetVsrClient(wallet, connection)
    handleSetNftClient(wallet, connection)
    handleSetGatewayClient(wallet, connection)
    handleSetPythClient(wallet, connection)
  }, [connection.endpoint])

  useEffect(() => {
    const handleVsrPlugin = () => {
      if (
        vsrClient &&
        currentPluginPk &&
        vsrPluginsPks.includes(currentPluginPk.toBase58())
      ) {
        handleSetVsrRegistrar(vsrClient, realm)
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: vsrClient,
            realm,
            walletPk:
              ownTokenRecord?.account?.governingTokenOwner || wallet?.publicKey,
          })
        }
      }
    }
    const handleNftplugin = () => {
      if (
        nftClient &&
        currentPluginPk &&
        nftPluginsPks.includes(currentPluginPk.toBase58())
      ) {
        handleSetNftRegistrar(nftClient!, realm)
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: nftClient,
            realm,
            walletPk:
              ownTokenRecord?.account?.governingTokenOwner || wallet?.publicKey,
          })
        }
      }
    }

    // If the current realm uses Civic Pass
    // register the gatekeeper network (the "type" of Civic)
    // in the Civic GatewayProvider.
    // This updates the UI to show if the user has a gateway token
    const handleGatewayPlugin = () => {
      if (
        gatewayClient &&
        currentPluginPk &&
        gatewayPluginsPks.includes(currentPluginPk.toBase58())
      ) {
        handleSetGatewayRegistrar(gatewayClient!, realm)
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: gatewayClient,
            realm,
            walletPk: wallet?.publicKey,
          })
        }

        handleRegisterGatekeeperNetwork()
      }
    }

    const handlePythPlugin = () => {
      if (
        pythClient &&
        currentPluginPk &&
        pythPluginsPks.includes(currentPluginPk.toBase58())
      ) {
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: pythClient,
            realm,
            walletPk:
              ownTokenRecord?.account?.governingTokenOwner || wallet?.publicKey,
          })
        }
      }
    }

    if (
      !currentClient ||
      currentClient.realm?.pubkey.toBase58() !== realm?.pubkey.toBase58() ||
      currentClient.walletPk?.toBase58() !== wallet?.publicKey?.toBase58()
    ) {
      handleNftplugin()
      handleGatewayPlugin()
      handleVsrPlugin()
      handlePythPlugin()
    }
  }, [
    currentPluginPk?.toBase58(),
    vsrClient?.program.programId.toBase58(),
    nftClient?.program.programId.toBase58(),
    gatewayClient?.program.programId.toBase58(),
    pythClient?.program.programId.toBase58(),
    realm?.pubkey.toBase58(),
    connection.endpoint,
    connected,
    ownTokenRecord,
  ])

  useEffect(() => {
    if (usedCollectionsPks.length && realm) {
      if (connected && currentClient.walletPk?.toBase58()) {
        handleGetNfts()
        handleRegisterGatekeeperNetwork()
      }

      handleMaxVoterWeight()
    } else {
      setVotingNfts([], currentClient, nftMintRegistrar)
      setMaxVoterWeight(null)
    }
  }, [
    JSON.stringify(usedCollectionsPks),
    currentPluginPk?.toBase58(),
    connected,
    realm?.pubkey.toBase58(),
    currentClient.walletPk?.toBase58(),
  ])
}
