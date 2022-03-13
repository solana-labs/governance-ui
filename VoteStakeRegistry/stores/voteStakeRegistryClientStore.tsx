import create, { State } from 'zustand'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { NftVoterClient } from '@solana/governance-program-library'
import {
  getNftRegistrarPDA,
  getRegistrarPDA,
  Registrar,
} from 'VoteStakeRegistry/sdk/accounts'
import { Provider } from '@project-serum/anchor'
import { Wallet } from '@project-serum/sol-wallet-adapter'
import { tryGetNftRegistrar, tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { ConnectionContext } from '@utils/connection'
import { ProgramAccount, Realm } from '@solana/spl-governance'

interface useVoteStakeRegistryClientStore extends State {
  state: {
    client: VsrClient | undefined
    nftClient: NftVoterClient | undefined
    communityMintRegistrar: Registrar | null
    nftMintRegistrar: any
  }
  handleSetClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetNftClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetRegistrar: (
    client: VsrClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
  handleSetNftRegistrar: (
    client: NftVoterClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
}

const defaultState = {
  client: undefined,
  nftClient: undefined,
  communityMintRegistrar: null,
  nftMintRegistrar: null,
}
//TODO Create abstracion for diffrent clients
const useVoteStakeRegistryClientStore = create<useVoteStakeRegistryClientStore>(
  (set, _get) => ({
    state: {
      ...defaultState,
    },
    handleSetClient: async (wallet, connection) => {
      const options = Provider.defaultOptions()
      const provider = new Provider(
        connection.current,
        (wallet as unknown) as Wallet,
        options
      )
      const vsrClient = await VsrClient.connect(
        provider,
        connection.cluster === 'devnet'
      )
      set((s) => {
        s.state.client = vsrClient
      })
    },
    handleSetRegistrar: async (client, realm) => {
      const clientProgramId = client!.program.programId
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetRegistrar(registrar, client!)
      set((s) => {
        s.state.communityMintRegistrar = existingRegistrar
      })
    },
    handleSetNftClient: async (wallet, connection) => {
      const options = Provider.defaultOptions()
      const provider = new Provider(
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
        realm!.account.communityMint,
        clientProgramId
      )
      const existingRegistrar = await tryGetNftRegistrar(registrar, client!)
      set((s) => {
        s.state.nftMintRegistrar = existingRegistrar
      })
    },
  })
)

export default useVoteStakeRegistryClientStore
