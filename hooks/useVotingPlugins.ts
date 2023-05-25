import { useCallback, useEffect, useMemo } from 'react'
import { getNfts } from '@utils/tokens'
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
import { NFTWithMeta } from '@utils/uiTypes/VotePlugin'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import * as heliumVsrSdk from '@helium/voter-stake-registry-sdk'
import useWalletOnePointOh from './useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from './queries/tokenOwnerRecord'
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

export function useVotingPlugins() {
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin

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

  const nftStore = useNftPluginStore()
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
  }, [gatewayClient, gatewayStore, realm])

  const getIsFromCollection = useCallback(
    (nft: NFTWithMeta) => {
      return (
        nft.collection &&
        nft.collection.mintAddress &&
        (nft.collection.verified ||
          typeof nft.collection.verified === 'undefined') &&
        usedCollectionsPks.includes(nft.collection.mintAddress) &&
        nft.collection.creators?.filter((x) => x.verified).length > 0
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
    wallet,
    currentPluginPk,
    handleSetNftClient,
    handleSetGatewayClient,
    handleSetPythClient,
    handleSetVsrClient,
    handleSetHeliumVsrClient,
  ])

  useEffect(() => {
    const handleVsrPlugin = () => {
      if (
        vsrClient &&
        currentPluginPk &&
        VSR_PLUGIN_PKS.includes(currentPluginPk.toBase58())
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

    const handleHeliumVsrPlugin = () => {
      if (
        heliumVsrClient &&
        currentPluginPk &&
        HELIUM_VSR_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetHeliumVsrRegistrar(heliumVsrClient, realm)
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: heliumVsrClient,
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
        NFT_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetNftRegistrar(nftClient, realm)
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
        GATEWAY_PLUGINS_PKS.includes(currentPluginPk.toBase58())
      ) {
        handleSetGatewayRegistrar(gatewayClient, realm)
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
        PYTH_PLUGINS_PKS.includes(currentPluginPk.toBase58())
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
      !currentClient ||
      currentClient.realm?.pubkey.toBase58() !== realm?.pubkey.toBase58() ||
      currentClient.walletPk?.toBase58() !== wallet?.publicKey?.toBase58() ||
      currentClient.walletPk?.toBase58() !==
        ownTokenRecord?.account?.governingTokenOwner.toBase58()
    ) {
      handleNftplugin()
      handleGatewayPlugin()
      handleVsrPlugin()
      handleHeliumVsrPlugin()
      //handleSwitchboardPlugin()
      handlePythPlugin()
    }
  }, [
    connected,
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
    ownTokenRecord?.account?.governingTokenOwner,
    pythClient,
    realm,
    vsrClient,
    wallet?.publicKey,
  ])

  useEffect(() => {
    const handleMaxVoterWeight = async () => {
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
        nftStore.setMaxVoterWeight(existingMaxVoterRecord)
      } catch (e) {
        console.log(e)
        nftStore.setMaxVoterWeight(null)
      }
    }

    const handleGetSwitchboardVoting = async () => {
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
    }

    const handleGetHeliumVsrVoting = async () => {
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
    }
    const handleGetNfts = async () => {
      nftStore.setIsLoadingNfts(true)
      if (!wallet?.publicKey) return
      try {
        const nfts = await getNfts(wallet.publicKey, connection)
        const votingNfts = nfts.filter(getIsFromCollection)
        const nftsWithMeta = votingNfts
        nftStore.setVotingNfts(nftsWithMeta, currentClient, nftMintRegistrar)
      } catch (e) {
        console.log(e)
        notify({
          message: `Something went wrong can't fetch nfts: ${e}`,
          type: 'error',
        })
      }
      nftStore.setIsLoadingNfts(false)
    }

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
      handleGetSwitchboardVoting()
    } else {
      nftStore.setVotingNfts([], currentClient, nftMintRegistrar)
      nftStore.setMaxVoterWeight(null)
    }
  }, [
    connected,
    connection,
    currentClient,
    currentPluginPk,
    getIsFromCollection,
    heliumStore,
    heliumVsrClient,
    nftClient,
    nftMintRegistrar,
    nftStore,
    realm,
    switchboardStore,
    usedCollectionsPks.length,
    wallet,
  ])
}
