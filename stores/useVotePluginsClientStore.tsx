import create, { State } from 'zustand'
import { GatewayClient } from '@solana/governance-program-library'
import { getRegistrarPDA, Registrar } from 'VoteStakeRegistry/sdk/accounts'
import { getRegistrarPDA as getPluginRegistrarPDA } from '@utils/plugin/accounts'
import { AnchorProvider, Wallet } from '@coral-xyz/anchor'
import {
  tryGetNftRegistrar,
  tryGetRegistrar,
  tryGetHeliumRegistrar,
} from 'VoteStakeRegistry/sdk/api'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { ConnectionContext } from '@utils/connection'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { VotingClient, VotingClientProps } from '@utils/uiTypes/VotePlugin'
import { PublicKey } from '@solana/web3.js'
import { tryGetGatewayRegistrar } from '../GatewayPlugin/sdk/api'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import { Registrar as HeliumVsrRegistrar } from 'HeliumVotePlugin/sdk/types'
import * as heliumVsrSdk from '@helium/voter-stake-registry-sdk'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { PythClient } from "@pythnetwork/staking"

interface UseVotePluginsClientStore extends State {
  state: {
    //diffrent plugins to choose because we will still have functions related only to one plugin
    vsrClient: VsrClient | undefined
    heliumVsrClient: HeliumVsrClient | undefined
    nftClient: NftVoterClient | undefined
    gatewayClient: GatewayClient | undefined
    pythClient: PythClient | undefined
    nftMintRegistrar: any
    gatewayRegistrar: any
    currentRealmVotingClient: VotingClient
    voteStakeRegistryRegistrar: Registrar | null
    voteStakeRegistryRegistrarPk: PublicKey | null
    heliumVsrRegistrar: HeliumVsrRegistrar | null
    maxVoterWeight: PublicKey | undefined
  }
  handleSetVsrClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext,
    programId: PublicKey
  ) => void
  handleSetHeliumVsrClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext,
    programId: PublicKey
  ) => void
  handleSetNftClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetGatewayClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetVsrRegistrar: (
    client: VsrClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetHeliumVsrRegistrar: (
    client: HeliumVsrClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetNftRegistrar: (
    client: NftVoterClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetGatewayRegistrar: (
    client: GatewayClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetCurrentRealmVotingClient: ({
    client,
    realm,
    walletPk,
  }: VotingClientProps) => void
  handleSetPythClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
}

const defaultState = {
  vsrClient: undefined,
  heliumVsrClient: undefined,
  nftClient: undefined,
  gatewayClient: undefined,
  pythClient: undefined,
  voteStakeRegistryRegistrar: null,
  heliumVsrRegistrar: null,
  voteStakeRegistryRegistrarPk: null,
  nftMintRegistrar: null,
  gatewayRegistrar: null,
  currentRealmVotingClient: new VotingClient({
    client: undefined,
    realm: undefined,
    walletPk: undefined,
  }),
  maxVoterWeight: undefined,
}

const useVotePluginsClientStore = create<UseVotePluginsClientStore>(
  (set, _get) => ({
    state: {
      ...defaultState,
    },
    handleSetVsrClient: async (wallet, connection, programId) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(
        provider,
        programId,
        connection.cluster === 'devnet'
      )
      set((s) => {
        s.state.vsrClient = vsrClient
      })
    },
    handleSetHeliumVsrClient: async (wallet, connection, programId) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )

      const heliumVsrClient = await HeliumVsrClient.connect(
        provider,
        programId,
        connection.cluster === 'devnet'
      )

      set((s) => {
        s.state.heliumVsrClient = heliumVsrClient
      })
    },
    handleSetVsrRegistrar: async (client, realm) => {
      console.log('setting vsr registrar')
      if (realm === undefined) return

      const clientProgramId = client.program.programId
      const { registrar } = await getRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, client)
      set((s) => {
        s.state.voteStakeRegistryRegistrar = existingRegistrar
        s.state.voteStakeRegistryRegistrarPk = registrar
      })
    },
    handleSetHeliumVsrRegistrar: async (client, realm) => {
      if (realm === undefined) return

      const clientProgramId = client.program.programId
      const [registrar] = heliumVsrSdk.registrarKey(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )

      const existingRegistrar = await tryGetHeliumRegistrar(registrar, client)

      set((s) => {
        s.state.heliumVsrRegistrar = existingRegistrar as HeliumVsrRegistrar
        s.state.voteStakeRegistryRegistrarPk = registrar
      })
    },
    handleSetNftClient: async (wallet, connection) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const nftClient = await NftVoterClient.connect(
        provider,
        connection.cluster === 'devnet'
      )
      set((s) => {
        s.state.nftClient = nftClient
      })
    },
    handleSetNftRegistrar: async (client, realm) => {
      if (realm === undefined) return

      const clientProgramId = client.program.programId
      const { registrar } = await getPluginRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetNftRegistrar(registrar, client)
      set((s) => {
        s.state.nftMintRegistrar = existingRegistrar
      })
    },
    handleSetGatewayRegistrar: async (client, realm) => {
      if (realm === undefined) return

      const clientProgramId = client.program.programId
      const { registrar } = await getPluginRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetGatewayRegistrar(registrar, client)
      set((s) => {
        s.state.gatewayRegistrar = existingRegistrar
      })
    },
    handleSetCurrentRealmVotingClient: ({ client, realm, walletPk }) => {
      set((s) => {
        s.state.currentRealmVotingClient = new VotingClient({
          client,
          realm,
          walletPk,
        })
      })
    },
    handleSetGatewayClient: async (wallet, connection) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const gatewayClient = await GatewayClient.connect(
        provider,
        connection.cluster === 'devnet'
      )
      set((s) => {
        s.state.gatewayClient = gatewayClient
      })
    },
    handleSetPythClient: async (wallet, connection) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const pythClient = await PythClient.connect(provider, "devnet")
      set((s) => {
        s.state.pythClient = pythClient
      })
    }
  })
)

export default useVotePluginsClientStore
