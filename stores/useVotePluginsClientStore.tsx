import create, { State } from 'zustand'
import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { NftVoterClient } from '@solana/governance-program-library'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
  Registrar,
} from 'VoteStakeRegistry/sdk/accounts'
import { Provider } from '@project-serum/anchor'
import { Wallet } from '@project-serum/sol-wallet-adapter'
import { tryGetNftRegistrar, tryGetRegistrar } from 'VoteStakeRegistry/sdk/api'
import { SignerWalletAdapter } from '@solana/wallet-adapter-base'
import { ConnectionContext } from '@utils/connection'
import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
} from '@solana/spl-governance'
import { getNftRegistrarPDA } from 'NftVotePlugin/sdk/accounts'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'

interface VotingClientProps {
  client: VsrClient | NftVoterClient | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
}
//Abstract for common functions that plugins will implement
export class VotingClient {
  client: VsrClient | NftVoterClient | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
  constructor({ client, realm, walletPk }: VotingClientProps) {
    this.client = client
    this.realm = realm
    this.walletPk = walletPk
  }
  withUpdateVoterWeightRecord = async (
    instructions: TransactionInstruction[]
  ) => {
    const client = this.client
    const realm = this.realm
    const walletPk = this.walletPk
    if (typeof this.client === 'undefined') {
      return
    }
    if (this.client instanceof VsrClient) {
      //if no plugin then we dont do anything
      if (!realm!.account.config.useCommunityVoterWeightAddin) {
        return
      }
      if (!client) {
        throw 'no vote registry plugin'
      }
      const clientProgramId = client!.program.programId

      //TODO support both mints for now only community is supported
      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        client!.program.programId
      )
      const { voter } = await getVoterPDA(registrar, walletPk!, clientProgramId)
      const { voterWeightPk } = await getVoterWeightPDA(
        registrar,
        walletPk!,
        clientProgramId
      )

      instructions.push(
        client.program.instruction.updateVoterWeightRecord({
          accounts: {
            registrar,
            voter,
            voterWeightRecord: voterWeightPk,
            systemProgram: SYSTEM_PROGRAM_ID,
          },
        })
      )
      return voterWeightPk
    }
  }
}
interface UseVotePluginsClientStore extends State {
  state: {
    //diffrent plugins to choose because we will still have functions related only to one plugin
    vsrClient: VsrClient | undefined
    nftClient: NftVoterClient | undefined
    voteStakeRegistryRegistrar: Registrar | null
    nftMintRegistrar: any
    currentRealmVotingClient: VotingClient
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
