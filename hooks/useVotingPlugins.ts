import { useCallback, useEffect, useMemo } from 'react'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getMaxVoterWeightRecord } from '@solana/spl-governance'
import { getMaxVoterWeightRecord as getPluginMaxVoterWeightRecord } from '@utils/plugin/accounts'
import { notify } from '@utils/notifications'

import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import { getGatekeeperNetwork } from '../GatewayPlugin/sdk/accounts'
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
  PYTH_PLUGIN_PK,
} from '../constants/plugins'
import useUserOrDelegator from './useUserOrDelegator'

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
    handleSetPythClient,
  } = useVotePluginsClientStore()

  const [setNftMaxVoterWeight] = useNftPluginStore((s) => [s.setMaxVoterWeight])

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
    pythClient,
  ] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.vsrClient,
    s.state.gatewayClient,
    s.state.nftClient,
    s.state.nftMintRegistrar,
    s.state.heliumVsrClient,
    s.state.pythClient,
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

  // initialise pyth plugin
  useEffect(() => {
    if (
      wallet &&
      connection &&
      currentPluginPk &&
      PYTH_PLUGIN_PK.includes(currentPluginPk.toBase58())
    ) {
      handleSetPythClient(wallet, connection)
    }
  }, [connection, currentPluginPk, handleSetPythClient, wallet])

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

    const handlePythPlugin = () => {
      if (
        pythClient &&
        currentPluginPk &&
        PYTH_PLUGIN_PK.includes(currentPluginPk.toBase58())
      ) {
        if (voterPk) {
          handleSetCurrentRealmVotingClient({
            client: pythClient,
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
      handlePythPlugin()
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
    pythClient,
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

  useEffect(() => {
    if (usedCollectionsPks.length && realm) {
      handleMaxVoterWeight()
    } else if (realm) {
      handleGetHeliumVsrVoting()
    } else {
      setNftMaxVoterWeight(null)
    }
  }, [
    connected,
    currentClient,
    currentPluginPk,
    handleGetHeliumVsrVoting,
    handleMaxVoterWeight,
    nftMintRegistrar,
    realm,
    setNftMaxVoterWeight,
    usedCollectionsPks.length,
  ])
}
