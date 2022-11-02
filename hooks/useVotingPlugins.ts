import { useEffect } from 'react'
import useWalletStore from 'stores/useWalletStore'
import useRealm from '@hooks/useRealm'
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
import * as anchor from '@project-serum/anchor'
import * as sbv2 from '@switchboard-xyz/switchboard-v2'
import sbIdl from 'SwitchboardVotePlugin/switchboard_v2.json'
import gonIdl from 'SwitchboardVotePlugin/gameofnodes.json'

import { STAKING_ADDRESS as PYTH_STAKING_ADDRESS } from 'pyth-staking-api'
import useGatewayPluginStore from '../GatewayPlugin/store/gatewayPluginStore'
import { getGatekeeperNetwork } from '../GatewayPlugin/sdk/accounts'
import { NFTWithMeta } from '@utils/uiTypes/VotePlugin'

export const vsrPluginsPks: string[] = [
  '4Q6WW2ouZ6V3iaNm56MTd5n2tnTm4C5fiH8miFHnAFHo',
  'vsr2nfGVNHmSY8uxoBGqq8AQbwz3JwaEaHqGbsTPXqQ',
  'VotEn9AWwTFtJPJSMV5F9jsMY6QwWM5qn3XP9PATGW7',
]

export const nftPluginsPks: string[] = [
  'GnftV5kLjd67tvHpNGyodwWveEKivz3ZWvvE3Z4xi2iw',
]

export const gatewayPluginsPks: string[] = [
  'Ggatr3wgDLySEwA2qEjt1oiw4BUzp5yMLJyz21919dq6', // v1
  'GgathUhdrCWRHowoRKACjgWhYHfxCEdBi5ViqYN6HVxk', // v2, supporting composition
]

export const switchboardPluginsPks: string[] = [SWITCHBOARD_ADDIN_ID.toBase58()]

export const pythPluginsPks: string[] = [PYTH_STAKING_ADDRESS.toBase58()]

export function useVotingPlugins() {
  const { realm, config, ownTokenRecord } = useRealm()
  const {
    handleSetVsrRegistrar,
    handleSetVsrClient,
    handleSetNftClient,
    handleSetGatewayClient,
    handleSetSwitchboardClient,
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
    setIsLoadingGatewayToken,
    setGatekeeperNetwork,
  } = useGatewayPluginStore()
  const {
    setIsLoading,
    setVotingPower,
    setOracleKeys,
    setInstructions,
  } = useSwitchboardPluginStore()

  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const connected = useWalletStore((s) => s.connected)
  const vsrClient = useVotePluginsClientStore((s) => s.state.vsrClient)
  const nftClient = useVotePluginsClientStore((s) => s.state.nftClient)
  const gatewayClient = useVotePluginsClientStore((s) => s.state.gatewayClient)
  const switchboardClient = useVotePluginsClientStore(
    (s) => s.state.switchboardClient
  )
  const pythClient = useVotePluginsClientStore((s) => s.state.pythClient)

  const currentClient = useVotePluginsClientStore(
    (s) => s.state.currentRealmVotingClient
  )
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
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
      const nfts = await getNfts(wallet!.publicKey!, connection)
      const votingNfts = nfts.filter(getIsFromCollection)
      const nftsWithMeta = votingNfts
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
  const handleGetSwitchboardVoting = async () => {
    if (!wallet || !wallet.publicKey || !realm) {
      return
    }

    setIsLoading(true)

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

      setOracleKeys(myNodesForRealm, currentClient)
      setInstructions(setVoterWeightInstructions, currentClient)

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
            setVotingPower(vwr.account.voterWeight)
          } else {
            // 'no sb governance'
            setVotingPower(new anchor.BN(0))
          }
        } catch (e) {
          console.log("Couldn't get voter weight record. Setting to zero.")
          setVotingPower(new anchor.BN(0))
        }
      } catch (e) {
        console.log("Couldn't get VWR")
        console.log(e)
      }
    } catch (e) {
      console.log(e)
    }
    setIsLoading(false)
  }

  const handleRegisterGatekeeperNetwork = async () => {
    if (realm && gatewayClient) {
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
  const getIsFromCollection = (nft: NFTWithMeta) => {
    return (
      nft.collection &&
      nft.collection.mintAddress &&
      (nft.collection.verified ||
        typeof nft.collection.verified === 'undefined') &&
      usedCollectionsPks.includes(nft.collection.mintAddress) &&
      nft.collection.creators?.filter((x) => x.verified).length > 0
    )
  }
  useEffect(() => {
    if (wallet) {
      handleSetVsrClient(wallet, connection, currentPluginPk)
      handleSetNftClient(wallet, connection)
      handleSetSwitchboardClient(wallet, connection)
      handleSetGatewayClient(wallet, connection)
      handleSetPythClient(wallet, connection)
    }
  }, [connection.endpoint, wallet, currentPluginPk])

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
    const handleSwitchboardPlugin = () => {
      if (
        switchboardClient &&
        currentPluginPk &&
        switchboardPluginsPks.includes(currentPluginPk.toBase58())
      ) {
        // Switchboard: don't think we need this
        //handleSetNftRegistrar(nftClient!, realm)
        console.log('Switchboard')
        if (connected) {
          handleSetCurrentRealmVotingClient({
            client: switchboardClient,
            realm,
            walletPk: wallet?.publicKey,
          })
        }
      }
    }
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
      handleSwitchboardPlugin()
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
    if (
      currentPluginPk &&
      switchboardPluginsPks.includes(currentPluginPk.toBase58())
    ) {
      handleGetSwitchboardVoting()
    }

    if (usedCollectionsPks.length && realm) {
      if (connected && currentClient.walletPk?.toBase58()) {
        handleGetNfts()
      }
      handleMaxVoterWeight()
    } else if (realm) {
      handleGetSwitchboardVoting()
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
