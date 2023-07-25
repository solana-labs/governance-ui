import { useCallback, useEffect, useMemo } from 'react'
// import { getNfts } from '@utils/tokens'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useSwitchboardPluginStore from 'SwitchboardVotePlugin/store/switchboardStore'
import {
  SWITCHBOARD_ID,
  SWITCHBOARD_ADDIN_ID,
} from 'SwitchboardVotePlugin/SwitchboardQueueVoterClient'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import {
  getMaxVoterWeightRecord,
  getVoterWeightRecord,
  getGovernanceAccount,
  Governance,
} from '@solana/spl-governance'
import { getMaxVoterWeightRecord as getPluginMaxVoterWeightRecord } from '@utils/plugin/accounts'
import { notify } from '@utils/notifications'
import * as anchor from '@coral-xyz/anchor'
import * as sbv2 from '@switchboard-xyz/switchboard-v2'
import sbIdl from 'SwitchboardVotePlugin/switchboard_v2.json'
import gonIdl from 'SwitchboardVotePlugin/gameofnodes.json'

import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import { getGatekeeperNetwork } from '../GatewayPlugin/sdk/accounts'
// import { NFTWithMeta } from '@utils/uiTypes/VotePlugin'
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
  PYTH_PLUGINS_PKS,
  SWITCHBOARD_PLUGINS_PKS,
} from '../constants/plugins'
import useUserOrDelegator from './useUserOrDelegator'
import { fetchDigitalAssetsByOwner } from './queries/digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { SUPPORT_CNFTS } from '@constants/flags'

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
    //handleSetSwitchboardClient,
    handleSetNftRegistrar,
    handleSetGatewayRegistrar,
    handleSetPythClient,
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
  const switchboardStore = useSwitchboardPluginStore()
  const wallet = useWalletOnePointOh()
  const connection = useLegacyConnectionContext()
  const connected = !!wallet?.connected

  const [
    currentClient,
    vsrClient,
    gatewayClient,
    //switchboardClient,
    pythClient,
    nftClient,
    nftMintRegistrar,
    heliumVsrClient,
  ] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.vsrClient,
    s.state.gatewayClient,
    //s.state.switchboardClient,
    s.state.pythClient,
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
    (nft: any) => {
      const collection = nft.grouping.find((x) => x.group_key === 'collection')
      return (
        (SUPPORT_CNFTS || !nft.compression.compressed) &&
        nft.grouping &&
        collection &&
        collection.group_value &&
        (collection.verified || typeof collection.verified === 'undefined') &&
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
      //handleSetSwitchboardClient(wallet, connection)
      handleSetGatewayClient(wallet, connection)
      handleSetPythClient(wallet, connection)
    }
  }, [
    connection,
    currentPluginPk,
    handleSetGatewayClient,
    handleSetHeliumVsrClient,
    handleSetNftClient,
    handleSetPythClient,
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

    const handlePythPlugin = () => {
      if (
        pythClient &&
        currentPluginPk &&
        PYTH_PLUGINS_PKS.includes(currentPluginPk.toBase58())
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
    /* 
    const handleSwitchboardPlugin = () => {
      if (
        switchboardClient &&
        currentPluginPk &&
        SWITCHBOARD_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        // Switchboard: don't think we need this
        //handleSetNftRegistrar(nftClient!, realm)
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: switchboardClient,
            realm,
            walletPk: wallet?.publicKey,
          })
        }
      }
    } */
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
      //handleSwitchboardPlugin()
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
    pythClient,
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

  const handleGetSwitchboardVoting = useCallback(async () => {
    console.log('im doing switchboard stuff')
    if (!wallet || !wallet.publicKey || !realm) {
      return
    }

    switchboardStore.setIsLoading(true)

    try {
      const options = anchor.AnchorProvider.defaultOptions()
      const provider = new anchor.AnchorProvider(
        connection.current,
        (wallet as unknown) as anchor.Wallet,
        options
      )

      let idl = await anchor.Program.fetchIdl(sbv2.SBV2_MAINNET_PID, provider)
      if (!idl) {
        idl = sbIdl as anchor.Idl
      }

      let addinIdl = await anchor.Program.fetchIdl(
        SWITCHBOARD_ADDIN_ID,
        provider
      )
      if (!addinIdl) {
        addinIdl = gonIdl as anchor.Idl
      }

      const switchboardProgram = new anchor.Program(
        idl,
        SWITCHBOARD_ID,
        provider
      )

      const addinProgram = new anchor.Program(
        addinIdl,
        SWITCHBOARD_ADDIN_ID,
        provider
      )

      const allOracles = await switchboardProgram.account.oracleAccountData.all()
      const oData = allOracles.map(({ publicKey, account }) => {
        return {
          oracleData: account as any,
          oracle: publicKey,
        }
      })

      const myNodesForRealm: PublicKey[] = []
      const setVoterWeightInstructions: TransactionInstruction[] = []

      for (const { oracle, oracleData } of oData) {
        if (!wallet || !wallet.publicKey || !realm || !oData) {
          continue
        }
        const queuePk = oracleData.queuePubkey as PublicKey

        const [addinState] = await PublicKey.findProgramAddress(
          [Buffer.from('state')],
          addinProgram.programId
        )

        const addinStateData = await addinProgram.account.state.fetch(
          addinState
        )
        const queue = await switchboardProgram.account.oracleQueueAccountData.fetch(
          queuePk
        )
        const queueAuthority = queue.authority as PublicKey
        const grantAuthority = addinStateData.grantAuthority as PublicKey
        try {
          const g = await getGovernanceAccount(
            provider.connection,
            grantAuthority,
            Governance
          )
          if (
            g.account.realm.equals(realm.pubkey) &&
            oracleData.oracleAuthority.equals(wallet.publicKey)
          ) {
            myNodesForRealm.push(oracle)
            const [p] = sbv2.PermissionAccount.fromSeed(
              switchboardProgram,
              queueAuthority,
              queuePk,
              oracle
            )

            const ix = await p.setVoterWeightTx({
              govProgram: realm.owner,
              pubkeySigner: wallet.publicKey,
              addinProgram: addinProgram,
              realm: realm.pubkey,
            })

            setVoterWeightInstructions.push(ix.instructions[0])
          }
        } catch (e) {
          console.log(e)
        }
      }

      switchboardStore.setOracleKeys(myNodesForRealm, currentClient)
      switchboardStore.setInstructions(
        setVoterWeightInstructions,
        currentClient
      )

      try {
        const [
          voterWeightRecord,
        ] = anchor.utils.publicKey.findProgramAddressSync(
          [Buffer.from('VoterWeightRecord'), myNodesForRealm[0].toBytes()],
          SWITCHBOARD_ADDIN_ID
        )

        try {
          const vwr = await getVoterWeightRecord(
            connection.current,
            voterWeightRecord
          )
          if (vwr && vwr.account.realm.equals(realm.pubkey)) {
            // get voting power
            switchboardStore.setVotingPower(vwr.account.voterWeight)
          } else {
            // 'no sb governance'
            switchboardStore.setVotingPower(new anchor.BN(0))
          }
        } catch (e) {
          console.log("Couldn't get voter weight record. Setting to zero.")
          switchboardStore.setVotingPower(new anchor.BN(0))
        }
      } catch (e) {
        console.log("Couldn't get VWR")
        console.log(e)
      }
    } catch (e) {
      console.log(e)
    }
    switchboardStore.setIsLoading(false)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connection,
    currentClient,
    realm,
    //switchboardStore,
    wallet,
  ])

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
      const votingNfts = nfts.filter(getIsFromCollection)
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
    if (
      currentPluginPk &&
      SWITCHBOARD_PLUGINS_PKS.includes(currentPluginPk.toBase58())
    ) {
      handleGetSwitchboardVoting()
    }
    if (usedCollectionsPks.length && realm) {
      if (connected && currentClient.walletPk?.toBase58()) {
        handleGetNfts()
      }
      handleMaxVoterWeight()
    } else if (realm) {
      handleGetHeliumVsrVoting()
      // @asktree: guys please dont spam network reqs even if your plugin isnt used
      // handleGetSwitchboardVoting()
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
    handleGetSwitchboardVoting,
    handleMaxVoterWeight,
    nftMintRegistrar,
    realm,
    setNftMaxVoterWeight,
    setVotingNfts,
    usedCollectionsPks.length,
  ])
}
