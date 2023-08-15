import { useCallback, useEffect, useMemo } from 'react'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getMaxVoterWeightRecord } from '@solana/spl-governance'
import { getMaxVoterWeightRecord as getPluginMaxVoterWeightRecord } from '@utils/plugin/accounts'
import { notify } from '@utils/notifications'

import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import { getGatekeeperNetwork } from '../GatewayPlugin/sdk/accounts'
import { DasNftObject } from '@hooks/queries/digitalAssets'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import * as heliumVsrSdk from '@helium/voter-stake-registry-sdk'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useRealmQuery } from './queries/realm'
import { useRealmConfigQuery } from './queries/realmConfig'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import {
  NFT_PLUGINS_PKS,
  HELIUM_VSR_PLUGINS_PKS,
  VSR_PLUGIN_PKS,
  GATEWAY_PLUGINS_PKS,
} from '../constants/plugins'
import useUserOrDelegator from './useUserOrDelegator'
import { getNetworkFromEndpoint } from '@utils/connection'
import { fetchDigitalAssetsByOwner } from './queries/digitalAssets'
import { ON_NFT_VOTER_V2, SUPPORT_CNFTS } from '@constants/flags'

export function useVotingPlugins() {
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const voterPk = useUserOrDelegator()

  const {
    handleSetVsrRegistrar,
    handleSetVsrClient,
    handleSetHeliumVsrRegistrar,
    handleSetHeliumVsrClient,
    handleSetNftClient,
    handleSetGatewayClient,
    handleSetNftRegistrar,
    handleSetGatewayRegistrar,
    handleSetCurrentRealmVotingClient,
  } = useVotePluginsClientStore()

  const [
    setIsLoadingNfts,
    setNftMaxVoterWeight,
    setVotingNfts,
  ] = useNftPluginStore((s) => [
    s.setIsLoadingNfts,
    s.setMaxVoterWeight,
    s.setVotingNfts,
  ])

  // @asktree: you should select what you need from stores, not use entire thing
  const heliumStore = useHeliumVsrStore()
  const gatewayStore = useGatewayPluginStore()
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const connected = !!wallet?.connected

  const [
    currentClient,
    vsrClient,
    gatewayClient,
    nftClient,
    nftMintRegistrar,
    heliumVsrClient,
  ] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.vsrClient,
    s.state.gatewayClient,
    s.state.nftClient,
    s.state.nftMintRegistrar,
    s.state.heliumVsrClient,
    s.state.heliumVsrRegistrar,
  ])

  const usedCollectionsPks: string[] = useMemo(
    () =>
      (currentPluginPk &&
        NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58()) &&
        nftMintRegistrar?.collectionConfigs.map((x) =>
          x.collection.toBase58()
        )) ||
      [],
    [currentPluginPk, nftMintRegistrar?.collectionConfigs]
  )

  const handleRegisterGatekeeperNetwork = useCallback(async () => {
    if (realm && gatewayClient) {
      gatewayStore.setIsLoadingGatewayToken(true)

      try {
        const gatekeeperNetwork = await getGatekeeperNetwork(
          gatewayClient,
          realm
        )

        gatewayStore.setGatekeeperNetwork(gatekeeperNetwork)
      } catch (e) {
        console.log(e)
        notify({
          message: 'Error fetching gateway token',
          type: 'error',
        })
      }
      gatewayStore.setIsLoadingGatewayToken(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    gatewayClient,
    //gatewayStore,
    realm,
  ])

  const getIsFromCollection = useCallback(
    (nft: DasNftObject) => {
      const collection = nft.grouping.find((x) => x.group_key === 'collection')
      return (
        (SUPPORT_CNFTS || !nft.compression.compressed) &&
        collection &&
        usedCollectionsPks.includes(collection.group_value) &&
        nft.creators?.filter((x) => x.verified).length > 0
      )
    },
    [usedCollectionsPks]
  )

  useEffect(() => {
    if (wallet && connection) {
      if (currentPluginPk) {
        if (VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58())) {
          handleSetVsrClient(wallet, connection, currentPluginPk)
        }
        if (HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk.toBase58())) {
          handleSetHeliumVsrClient(wallet, connection, currentPluginPk)
        }
      }
      handleSetNftClient(wallet, connection)
      handleSetGatewayClient(wallet, connection)
    }
  }, [
    connection,
    currentPluginPk,
    handleSetGatewayClient,
    handleSetHeliumVsrClient,
    handleSetNftClient,
    handleSetVsrClient,
    wallet,
  ])

  useEffect(() => {
    const handleVsrPlugin = () => {
      if (
        vsrClient &&
        currentPluginPk &&
        VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetVsrRegistrar(vsrClient, realm)
        if (voterPk) {
          handleSetCurrentRealmVotingClient({
            client: vsrClient,
            realm,
            walletPk: voterPk,
          })
        }
      }
    }

    const handleHeliumVsrPlugin = () => {
      if (
        heliumVsrClient &&
        currentPluginPk &&
        HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetHeliumVsrRegistrar(heliumVsrClient, realm)
        if (voterPk) {
          handleSetCurrentRealmVotingClient({
            client: heliumVsrClient,
            realm,
            walletPk: voterPk,
          })
        }
      }
    }

    const handleNftplugin = () => {
      if (
        nftClient &&
        currentPluginPk &&
        NFT_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetNftRegistrar(nftClient, realm)
        if (voterPk) {
          handleSetCurrentRealmVotingClient({
            client: nftClient,
            realm,
            walletPk: voterPk,
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
        GATEWAY_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetGatewayRegistrar(gatewayClient, realm)
        if (voterPk) {
          handleSetCurrentRealmVotingClient({
            client: gatewayClient,
            realm,
            walletPk: voterPk,
          })
        }

        handleRegisterGatekeeperNetwork()
      }
    }

    if (
      realm &&
      (!currentClient ||
        currentClient.realm?.pubkey.toBase58() !== realm.pubkey.toBase58() ||
        (voterPk && currentClient.walletPk?.toBase58() !== voterPk.toBase58()))
    ) {
      console.log(
        'setting plugin; if this is getting spammed, this store just needs to be refactored away'
      )
      handleNftplugin()
      handleGatewayPlugin()
      handleVsrPlugin()
      handleHeliumVsrPlugin()
    }
  }, [
    currentClient,
    currentPluginPk,
    gatewayClient,
    handleRegisterGatekeeperNetwork,
    handleSetCurrentRealmVotingClient,
    handleSetGatewayRegistrar,
    handleSetHeliumVsrRegistrar,
    handleSetNftRegistrar,
    handleSetVsrRegistrar,
    heliumVsrClient,
    nftClient,
    voterPk,
    realm,
    vsrClient,
  ])

  const handleMaxVoterWeight = useCallback(async () => {
    if (!realm || !nftClient) return

    const { maxVoterWeightRecord } = await getPluginMaxVoterWeightRecord(
      realm.pubkey,
      realm.account.communityMint,
      nftClient.program.programId
    )
    try {
      const existingMaxVoterRecord = await getMaxVoterWeightRecord(
        connection.current,
        maxVoterWeightRecord
      )
      setNftMaxVoterWeight(existingMaxVoterRecord)
    } catch (e) {
      console.log(e)
      setNftMaxVoterWeight(null)
    }
  }, [connection, nftClient, setNftMaxVoterWeight, realm])

  const handleGetHeliumVsrVoting = useCallback(async () => {
    if (
      realm &&
      currentPluginPk &&
      HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk.toBase58())
    ) {
      const [maxVoterRecord] = heliumVsrSdk.maxVoterWeightRecordKey(
        realm.pubkey,
        realm.account.communityMint,
        currentPluginPk
      )
      try {
        const mvwr = await getMaxVoterWeightRecord(
          connection.current,
          maxVoterRecord
        )
        heliumStore.setMaxVoterWeight(mvwr)
      } catch (_e) {
        console.log("Couldn't get max voter weight record. Setting to null.")
        heliumStore.setMaxVoterWeight(null)
      }

      if (currentClient.walletPk && heliumVsrClient) {
        try {
          await heliumStore.getPositions({
            realmPk: realm.pubkey,
            communityMintPk: realm.account.communityMint,
            walletPk: currentClient.walletPk,
            connection: connection.current,
            client: heliumVsrClient,
            votingClient: currentClient,
          })
        } catch (e) {
          console.log(e)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connection,
    currentClient,
    currentPluginPk,
    //heliumStore,
    heliumVsrClient,
    realm,
  ])

  const handleGetNfts = useCallback(async () => {
    setIsLoadingNfts(true)
    if (!wallet?.publicKey) return
    try {
      // const nfts = await getNfts(wallet.publicKey, connection)
      const network = getNetworkFromEndpoint(connection.endpoint)
      if (network === 'localnet') throw new Error()
      const nfts = await fetchDigitalAssetsByOwner(network, wallet.publicKey)
      const votingNfts = nfts
        .filter(getIsFromCollection)
        .filter((x) => ON_NFT_VOTER_V2 || !x.compression.compressed)
      const nftsWithMeta = votingNfts
      setVotingNfts(nftsWithMeta, currentClient, nftMintRegistrar)
    } catch (e) {
      console.log(e)
      notify({
        message: `Something went wrong can't fetch nfts: ${e}`,
        type: 'error',
      })
    }
    setIsLoadingNfts(false)
  }, [
    connection,
    currentClient,
    getIsFromCollection,
    nftMintRegistrar,
    setIsLoadingNfts,
    setVotingNfts,
    wallet?.publicKey,
  ])

  useEffect(() => {
    if (usedCollectionsPks.length && realm) {
      if (connected && currentClient.walletPk?.toBase58()) {
        handleGetNfts()
      }
      handleMaxVoterWeight()
    } else if (realm) {
      handleGetHeliumVsrVoting()
    } else {
      setVotingNfts([], currentClient, nftMintRegistrar)
      setNftMaxVoterWeight(null)
    }
  }, [
    connected,
    currentClient,
    currentPluginPk,
    handleGetHeliumVsrVoting,
    handleGetNfts,
    handleMaxVoterWeight,
    nftMintRegistrar,
    realm,
    setNftMaxVoterWeight,
    setVotingNfts,
    usedCollectionsPks.length,
  ])
}
