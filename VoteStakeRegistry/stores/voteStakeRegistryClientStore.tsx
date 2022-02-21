import create, { State } from 'zustand'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { getRegistrarPDA, Registrar } from 'VoteStakeRegistry/sdk/accounts'
import { Provider } from '@project-serum/anchor'
import { Wallet } from '@project-serum/sol-wallet-adapter'
import { tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { ConnectionContext } from '@utils/connection'
import { ProgramAccount, Realm } from '@solana/spl-governance'

interface useVoteStakeRegistryClientStore extends State {
  state: {
    client: VsrClient | undefined
    communityMintRegistrar: Registrar | null
  }
  handleSetClient: (
    wallet: SignerWalletAdapter | undefined,
    connection: ConnectionContext
  ) => void
  handleSetRegistrar: (
    client: VsrClient,
    realm: ProgramAccount<Realm> | undefined
  ) => void
}

const defaultState = {
  client: undefined,
  communityMintRegistrar: null,
}

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
  })
)

export default useVoteStakeRegistryClientStore
