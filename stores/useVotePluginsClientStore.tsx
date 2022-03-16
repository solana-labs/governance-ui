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
import {
  getNftRegistrarPDA,
  getNftVoterWeightRecord,
} from 'NftVotePlugin/sdk/accounts'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'

type updateVoterWeightRecordTypes =
  | 'castVote'
  | 'commentProposal'
  | 'createGovernance'
  | 'createProposal'
  | 'signOffProposal'
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
  currentVoterNftsAccounts: { metadata: Metadata; tokenAddress: PublicKey }[]
  constructor({ client, realm, walletPk }: VotingClientProps) {
    this.client = client
    this.realm = realm
    this.walletPk = walletPk
    this.currentVoterNftsAccounts = []
  }
  withUpdateVoterWeightRecord = async (
    instructions: TransactionInstruction[],
    type: updateVoterWeightRecordTypes
  ) => {
    const realm = this.realm
    const walletPk = this.walletPk
    if (
      !realm?.account.config.useCommunityVoterWeightAddin ||
      typeof this.client === 'undefined'
    ) {
      return
    }
    if (this.client instanceof VsrClient) {
      const clientProgramId = this.client!.program.programId

      const { registrar } = await getRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        this.client!.program.programId
      )
      const { voter } = await getVoterPDA(registrar, walletPk!, clientProgramId)
      const { voterWeightPk } = await getVoterWeightPDA(
        registrar,
        walletPk!,
        clientProgramId
      )
      instructions.push(
        this.client!.program.instruction.updateVoterWeightRecord({
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
    if (this.client instanceof NftVoterClient) {
      const clientProgramId = this.client!.program.programId

      const { registrar } = await getNftRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        this.client!.program.programId
      )
      const { voterWeightPk } = await this._withHandleNftVoterWeight(
        realm!,
        walletPk!,
        clientProgramId,
        instructions
      )
      const remainingAccounts: {
        pubkey: PublicKey
        isSigner: boolean
        isWritable: boolean
      }[] = []
      for (const nft of this.currentVoterNftsAccounts) {
        remainingAccounts.push({
          pubkey: nft.tokenAddress,
          isSigner: false,
          isWritable: false,
        })
        remainingAccounts.push({
          pubkey: nft.metadata.pubkey,
          isSigner: false,
          isWritable: false,
        })
      }
      console.log(remainingAccounts.map((x) => x.pubkey.toBase58()))
      instructions.push(
        this.client.program.instruction.updateVoterWeightRecord(
          { [type]: {} },
          {
            accounts: {
              registrar,
              voterWeightRecord: voterWeightPk,
            },
            remainingAccounts: remainingAccounts,
          }
        )
      )
      return voterWeightPk
    }
  }
  withCastPluginVote = async (instructions, proposalPk: PublicKey) => {
    const realm = this.realm
    const walletPk = this.walletPk!
    if (
      !realm?.account.config.useCommunityVoterWeightAddin ||
      typeof this.client === 'undefined'
    ) {
      return
    }
    if (this.client instanceof NftVoterClient) {
      const clientProgramId = this.client!.program.programId
      const { registrar } = await getNftRegistrarPDA(
        realm!.pubkey,
        realm!.account.communityMint,
        this.client!.program.programId
      )
      const { voterWeightPk } = await this._withHandleNftVoterWeight(
        realm!,
        walletPk,
        clientProgramId,
        instructions
      )
      const remainingAccounts: {
        pubkey: PublicKey
        isSigner: boolean
        isWritable: boolean
      }[] = []
      for (const nft of this.currentVoterNftsAccounts) {
        remainingAccounts.push({
          pubkey: nft.tokenAddress,
          isSigner: false,
          isWritable: false,
        })
        remainingAccounts.push({
          pubkey: nft.metadata.pubkey,
          isSigner: false,
          isWritable: false,
        })
        const [nftVoteRecord] = await PublicKey.findProgramAddress(
          [
            Buffer.from('nft-vote-record'),
            proposalPk.toBuffer(),
            new PublicKey(nft.metadata.data.mint).toBuffer(),
          ],
          clientProgramId
        )
        remainingAccounts.push({
          pubkey: nftVoteRecord,
          isSigner: false,
          isWritable: false,
        })
      }
      instructions.push(
        this.client.program.instruction.castNftVote(proposalPk, {
          accounts: {
            registrar,
            voterWeightRecord: voterWeightPk,
            governingTokenOwner: walletPk,
            payer: walletPk,
            systemProgram: SYSTEM_PROGRAM_ID,
          },
          remainingAccounts: remainingAccounts,
        })
      )
    }
  }
  withRelinquishVote = async (instructions, proposalPk: PublicKey) => {
    const realm = this.realm
    const walletPk = this.walletPk!
    console.log(walletPk, instructions, proposalPk)
    if (
      !realm?.account.config.useCommunityVoterWeightAddin ||
      typeof this.client === 'undefined'
    ) {
      return
    }
    // if (this.client instanceof NftVoterClient) {
    //   const clientProgramId = this.client!.program.programId
    //   const { registrar } = await getNftRegistrarPDA(
    //     realm!.pubkey,
    //     realm!.account.communityMint,
    //     this.client!.program.programId
    //   )
    // const { voterWeightPk } = await this._withHandleNftVoterWeight(
    //     realm!,
    //     walletPk,
    //     clientProgramId,
    //     instructions
    //   )
    //   instructions.push(
    //     this.client.program.instruction.relinquishNftVote(proposalPk, {
    //       accounts: {
    //         registrar,
    //         voterWeightRecord: voterWeightPk,
    //         governingTokenOwner: walletPk,
    //         payer: walletPk,
    //         systemProgram: SYSTEM_PROGRAM_ID,
    //       },
    //     })
    //   )
    // }
  }
  _withHandleNftVoterWeight = async (
    realm: ProgramAccount<Realm>,
    walletPk: PublicKey,
    clientProgramId: PublicKey,
    instructions
  ) => {
    if (this.client instanceof NftVoterClient === false) {
      throw 'Method only allowed for nft voter client'
    }
    let isExisting: any = undefined
    const client = this.client as NftVoterClient
    const {
      voterWeightPk,
      voterWeightRecordBump,
    } = await getNftVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      walletPk!,
      clientProgramId
    )
    try {
      isExisting = await client.program.account.voterWeightRecord.fetch(
        voterWeightPk
      )
    } catch (e) {
      console.log('No voter, creating voter', e)
    }
    if (!isExisting) {
      instructions.push(
        client.program.instruction.createVoterWeightRecord(walletPk, {
          accounts: {
            voterWeightRecord: voterWeightPk,
            governanceProgramId: realm.owner,
            realm: realm.pubkey,
            realmGoverningTokenMint: realm.account.communityMint,
            payer: walletPk,
            systemProgram: SYSTEM_PROGRAM_ID,
          },
        })
      )
    }

    return { voterWeightPk, voterWeightRecordBump }
  }
  _setCurrentVoterNfts = (nfts: any[]) => {
    this.currentVoterNftsAccounts = nfts
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
