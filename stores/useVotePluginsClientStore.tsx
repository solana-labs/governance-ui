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
  getNftMaxVoterWeightRecord,
  getNftRegistrarPDA,
  getNftVoterWeightRecord,
} from 'NftVotePlugin/sdk/accounts'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { NFTWithMint } from '@utils/uiTypes/nfts'

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

interface NFTWithMeta extends NFTWithMint {
  metadata: Metadata
}

enum VotingClientType {
  NoClient,
  VsrClient,
  NftVoterClient,
}

class AccountData {
  pubkey: PublicKey
  isSigner: boolean
  isWritable: boolean
  constructor(
    pubkey: PublicKey | string,
    isSigner = false,
    isWritable = false
  ) {
    this.pubkey = typeof pubkey === 'string' ? new PublicKey(pubkey) : pubkey
    this.isSigner = isSigner
    this.isWritable = isWritable
  }
}

interface ProgramAddresses {
  voterWeightPk: PublicKey | undefined
  maxVoterWeightRecord: PublicKey | undefined
}

//Abstract for common functions that plugins will implement
export class VotingClient {
  client: VsrClient | NftVoterClient | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
  votingNfts: NFTWithMeta[]
  clientType: VotingClientType
  noClient: boolean
  constructor({ client, realm, walletPk }: VotingClientProps) {
    this.client = client
    this.realm = realm
    this.walletPk = walletPk
    this.votingNfts = []
    this.noClient = true
    this.clientType = VotingClientType.NoClient
    if (this.client instanceof VsrClient) {
      this.clientType = VotingClientType.VsrClient
      this.noClient = false
    }
    if (this.client instanceof NftVoterClient) {
      this.clientType = VotingClientType.NftVoterClient
      this.noClient = false
    }
  }
  withUpdateVoterWeightRecord = async (
    instructions: TransactionInstruction[],
    type: updateVoterWeightRecordTypes
  ): Promise<ProgramAddresses | undefined> => {
    if (this.noClient) {
      return
    }
    const clientProgramId = this.client!.program.programId
    const realm = this.realm!
    const walletPk = this.walletPk!
    if (this.client instanceof VsrClient) {
      const { registrar } = await getRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )
      const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
      const { voterWeightPk } = await getVoterWeightPDA(
        registrar,
        walletPk,
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
      return { voterWeightPk, maxVoterWeightRecord: undefined }
    }
    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getNftRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        this.client!.program.programId
      )
      const {
        voterWeightPk,
        maxVoterWeightRecord,
      } = await this._withHandleNftVoterWeight(
        realm,
        walletPk,
        clientProgramId,
        instructions
      )
      const remainingAccounts: AccountData[] = []
      for (let i = 0; i < this.votingNfts.length; i++) {
        const nft = this.votingNfts[i]
        remainingAccounts.push(
          new AccountData(nft.tokenAddress),
          new AccountData(nft.metadata.pubkey)
        )
      }

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
      return { voterWeightPk, maxVoterWeightRecord }
    }
  }
  withCastPluginVote = async (
    instructions,
    proposalPk: PublicKey
  ): Promise<ProgramAddresses | undefined> => {
    if (this.noClient) {
      return
    }
    const clientProgramId = this.client!.program.programId
    const realm = this.realm!
    const walletPk = this.walletPk!
    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getNftRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        this.client!.program.programId
      )
      const {
        voterWeightPk,
        maxVoterWeightRecord,
      } = await this._withHandleNftVoterWeight(
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
      for (let i = 0; i < this.votingNfts.length; i++) {
        const nft = this.votingNfts[i]
        const [nftVoteRecord] = await PublicKey.findProgramAddress(
          [
            Buffer.from('nft-vote-record'),
            proposalPk.toBuffer(),
            new PublicKey(nft.metadata.data.mint).toBuffer(),
          ],
          clientProgramId
        )
        remainingAccounts.push(
          new AccountData(nft.tokenAddress),
          new AccountData(nft.metadata.pubkey),
          new AccountData(nftVoteRecord)
        )
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
      return { voterWeightPk, maxVoterWeightRecord }
    }
    if (this.client instanceof VsrClient) {
      const props = await this.withUpdateVoterWeightRecord(
        instructions,
        'castVote'
      )
      return props
    }
  }
  withRelinquishVote = async (
    instructions,
    proposalPk: PublicKey
  ): Promise<ProgramAddresses | undefined> => {
    console.log(instructions, proposalPk)
    if (this.noClient) {
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
    _instructions
  ) => {
    if (this.client instanceof NftVoterClient === false) {
      throw 'Method only allowed for nft voter client'
    }
    // let isExisting: any = undefined
    // const client = this.client as NftVoterClient
    const {
      voterWeightPk,
      voterWeightRecordBump,
    } = await getNftVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      walletPk!,
      clientProgramId
    )

    const {
      maxVoterWeightRecord,
      maxVoterWeightRecordBump,
    } = await getNftMaxVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      clientProgramId
    )

    // try {
    //   isExisting = await client.program.account.voterWeightRecord.fetch(
    //     voterWeightPk
    //   )
    // } catch (e) {
    //   console.log('No voter, creating voter', e)
    // }
    // if (!isExisting) {
    //   instructions.push(
    //     client.program.instruction.createVoterWeightRecord(walletPk, {
    //       accounts: {
    //         voterWeightRecord: voterWeightPk,
    //         governanceProgramId: realm.owner,
    //         realm: realm.pubkey,
    //         realmGoverningTokenMint: realm.account.communityMint,
    //         payer: walletPk,
    //         systemProgram: SYSTEM_PROGRAM_ID,
    //       },
    //     })
    //   )
    // }

    return {
      voterWeightPk,
      voterWeightRecordBump,
      maxVoterWeightRecord,
      maxVoterWeightRecordBump,
    }
  }
  _setCurrentVoterNfts = (nfts: NFTWithMeta[]) => {
    this.votingNfts = nfts
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
