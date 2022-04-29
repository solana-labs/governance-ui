import create, { State } from 'zustand'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { NftVoterClient } from '@solana/governance-program-library'
import { getRegistrarPDA, Registrar } from 'VoteStakeRegistry/sdk/accounts'
import { AnchorProvider, Wallet } from '@project-serum/anchor'
import { tryGetNftRegistrar, tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { ConnectionContext } from '@utils/connection'
import { ProgramAccount, Realm } from '@solana/spl-governance'
import { getNftRegistrarPDA } from 'NftVotePlugin/sdk/accounts'
import { VotingClient, VotingClientProps } from '@utils/uiTypes/VotePlugin'
import { PublicKey } from '@solana/web3.js'

interface UseVotePluginsClientStore extends State {
  state: {
    //diffrent plugins to choose because we will still have functions related only to one plugin
    vsrClient: VsrClient | undefined
    nftClient: NftVoterClient | undefined
    voteStakeRegistryRegistrar: Registrar | null
    nftMintRegistrar: any
    currentRealmVotingClient: VotingClient
    voteStakeRegistryRegistrarPk: PublicKey | null
  }
  handleSetVsrClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetNftClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetVsrRegistrar: (
    client: VsrClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetNftRegistrar: (
    client: NftVoterClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetCurrentRealmVotingClient: ({
    client,
    realm,
    walletPk,
  }: VotingClientProps) => void
}

const defaultState = {
  vsrClient: undefined,
  nftClient: undefined,
  voteStakeRegistryRegistrar: null,
  voteStakeRegistryRegistrarPk: null,
  nftMintRegistrar: null,
  currentRealmVotingClient: new VotingClient({
    client: undefined,
    realm: undefined,
    walletPk: undefined,
  }),
}

const useVotePluginsClientStore = create<UseVotePluginsClientStore>(
  (set, _get) => ({
    state: {
      ...defaultState,
    },
    handleSetVsrClient: async (wallet, connection) => {
      const options = AnchorProvider.defaultOptions()
      const provider = new AnchorProvider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(
        provider,
        connection.cluster === 'devnet'
      )
      set((s) => {
        s.state.vsrClient = vsrClient
      })
    },
    handleSetVsrRegistrar: async (client, realm) => {
      const clientProgramId = client!.program.programId
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, client!)
      set((s) => {
        s.state.voteStakeRegistryRegistrar = existingRegistrar
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
      const clientProgramId = client!.program.programId
      const { registrar } = await getNftRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetNftRegistrar(registrar, client!)
      set((s) => {
        s.state.nftMintRegistrar = existingRegistrar
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
  })
)

export default useVotePluginsClientStore
