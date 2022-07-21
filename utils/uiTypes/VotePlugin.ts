import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import {
  NftVoterClient,
  GatewayClient,
} from '@solana/governance-program-library'
import {
  SwitchboardQueueVoterClient,
  SWITCHBOARD_ADDIN_ID,
} from '../../SwitchboardVotePlugin/SwitchboardQueueVoterClient'
import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
  Proposal,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { chunks } from '@utils/helpers'
import { PythClient } from 'pyth-staking-api'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { NFTWithMint } from './nfts'
import {
  getPreviousVotingWeightRecord,
  getVoteInstruction,
} from '../../GatewayPlugin/sdk/accounts'
import {
  getVoterWeightRecord as getPluginVoterWeightRecord,
  getRegistrarPDA as getPluginRegistrarPDA,
  getMaxVoterWeightRecord as getPluginMaxVoterWeightRecord,
} from '@utils/plugin/accounts'

type UpdateVoterWeightRecordTypes =
  | 'castVote'
  | 'commentProposal'
  | 'createGovernance'
  | 'createProposal'
  | 'signOffProposal'

export interface VotingClientProps {
  client:
    | VsrClient
    | NftVoterClient
    | SwitchboardQueueVoterClient
    | PythClient
    | GatewayClient
    | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
}

export interface NFTWithMeta extends NFTWithMint {
  metadata: Metadata
}

enum VotingClientType {
  NoClient,
  VsrClient,
  NftVoterClient,
  SwitchboardVoterClient,
  PythClient,
  GatewayClient,
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
  client:
    | VsrClient
    | NftVoterClient
    | SwitchboardQueueVoterClient
    | PythClient
    | GatewayClient
    | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
  votingNfts: NFTWithMeta[]
  gatewayToken: PublicKey
  oracles: PublicKey[]
  instructions: TransactionInstruction[]
  clientType: VotingClientType
  noClient: boolean
  constructor({ client, realm, walletPk }: VotingClientProps) {
    this.client = client
    this.realm = realm
    this.walletPk = walletPk
    this.votingNfts = []
    this.oracles = []
    this.instructions = []
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
    if (this.client instanceof SwitchboardQueueVoterClient) {
      this.clientType = VotingClientType.SwitchboardVoterClient
      this.noClient = false
    }
    if (this.client instanceof GatewayClient) {
      this.clientType = VotingClientType.GatewayClient
      this.noClient = false
    }
    if (this.client instanceof GatewayClient) {
      this.clientType = VotingClientType.GatewayClient
      this.noClient = false
    }
    if (this.client instanceof PythClient) {
      this.clientType = VotingClientType.PythClient
      this.noClient = false
    }
  }
  withUpdateVoterWeightRecord = async (
    instructions: TransactionInstruction[],
    tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
    type: UpdateVoterWeightRecordTypes,
    voterWeightTarget?: PublicKey
  ): Promise<ProgramAddresses | undefined> => {
    if (this.noClient) {
      return
    }
    const clientProgramId = this.client!.program.programId
    const realm = this.realm!
    const walletPk = this.walletPk!
    if (
      realm.account.communityMint.toBase58() !==
      tokenOwnerRecord.account.governingTokenMint.toBase58()
    ) {
      return
    }

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
      const updateVoterWeightRecordIx = await this.client!.program.methods.updateVoterWeightRecord()
        .accounts({
          registrar,
          voter,
          voterWeightRecord: voterWeightPk,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .instruction()
      instructions.push(updateVoterWeightRecordIx)
      return { voterWeightPk, maxVoterWeightRecord: undefined }
    }

    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getPluginRegistrarPDA(
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
      const updateVoterWeightRecordIx = await this.client.program.methods
        .updateVoterWeightRecord({ [type]: {} })
        .accounts({
          registrar: registrar,
          voterWeightRecord: voterWeightPk,
        })
        .remainingAccounts(remainingAccounts.slice(0, 10))
        .instruction()
      instructions.push(updateVoterWeightRecordIx)
      return { voterWeightPk, maxVoterWeightRecord }
    }
    if (this.client instanceof GatewayClient) {
      const { voterWeightPk } = await this._withHandleGatewayVoterWeight(
        realm,
        walletPk,
        clientProgramId,
        instructions
      )

      if (!this.gatewayToken)
        throw new Error(`Unable to execute transaction: No Civic Pass found`)

      const updateVoterWeightRecordIx = await getVoteInstruction(
        this.client,
        this.gatewayToken,
        realm,
        walletPk
      )
      instructions.push(updateVoterWeightRecordIx)
      return { voterWeightPk, maxVoterWeightRecord: undefined }
    }
    if (this.client instanceof PythClient) {
      const stakeAccount = await this.client!.stakeConnection.getMainAccount(
        walletPk
      )

      const {
        voterWeightAccount,
        maxVoterWeightRecord,
      } = await this.client.stakeConnection.withUpdateVoterWeight(
        instructions,
        stakeAccount!,
        { [type]: {} },
        voterWeightTarget
      )

      return {
        voterWeightPk: voterWeightAccount,
        maxVoterWeightRecord,
      }
    }
    if (this.client instanceof SwitchboardQueueVoterClient) {
      instructions.push(this.instructions[0])
      const [vwr] = await PublicKey.findProgramAddress(
        [Buffer.from('VoterWeightRecord'), this.oracles[0].toBytes()],
        SWITCHBOARD_ADDIN_ID
      )
      return { voterWeightPk: vwr, maxVoterWeightRecord: undefined }
    }
  }
  withCastPluginVote = async (
    instructions: TransactionInstruction[],
    proposal: ProgramAccount<Proposal>,
    tokeOwnerRecord: ProgramAccount<TokenOwnerRecord>
  ): Promise<ProgramAddresses | undefined> => {
    if (this.noClient) {
      return
    }
    const clientProgramId = this.client!.program.programId
    const realm = this.realm!
    const walletPk = this.walletPk!
    if (
      realm.account.communityMint.toBase58() !==
      proposal.account.governingTokenMint.toBase58()
    ) {
      return
    }

    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getPluginRegistrarPDA(
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
      const nftVoteRecordsFiltered = await this.client.program.account.nftVoteRecord.all(
        [
          {
            memcmp: {
              offset: 8,
              bytes: proposal.pubkey.toBase58(),
            },
          },
        ]
      )
      for (let i = 0; i < this.votingNfts.length; i++) {
        const nft = this.votingNfts[i]
        const [nftVoteRecord] = await PublicKey.findProgramAddress(
          [
            Buffer.from('nft-vote-record'),
            proposal.pubkey.toBuffer(),
            new PublicKey(nft.metadata.data.mint).toBuffer(),
          ],
          clientProgramId
        )
        if (
          !nftVoteRecordsFiltered.find(
            (x) => x.publicKey.toBase58() === nftVoteRecord.toBase58()
          )
        )
          remainingAccounts.push(
            new AccountData(nft.tokenAddress),
            new AccountData(nft.metadata.pubkey),
            new AccountData(nftVoteRecord, false, true)
          )
      }
      //1 nft is 3 accounts
      const firstFiveNfts = remainingAccounts.slice(0, 15)
      const remainingNftsToChunk = remainingAccounts.slice(
        15,
        remainingAccounts.length
      )
      const nftsChunk = chunks(remainingNftsToChunk, 12)
      for (const i of nftsChunk) {
        const castNftVoteIx = await this.client.program.methods
          .castNftVote(proposal.pubkey)
          .accounts({
            registrar,
            voterWeightRecord: voterWeightPk,
            governingTokenOwner: walletPk,
            payer: walletPk,
            systemProgram: SYSTEM_PROGRAM_ID,
          })
          .remainingAccounts(i)
          .instruction()

        instructions.push(castNftVoteIx)
      }
      const castNftVoteIx2 = await this.client.program.methods
        .castNftVote(proposal.pubkey)
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          governingTokenOwner: walletPk,
          payer: walletPk,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts(firstFiveNfts)
        .instruction()
      instructions.push(castNftVoteIx2)
      return { voterWeightPk, maxVoterWeightRecord }
    }

    if (this.client instanceof VsrClient) {
      const props = await this.withUpdateVoterWeightRecord(
        instructions,
        tokeOwnerRecord,
        'castVote'
      )
      return props
    }
    if (this.client instanceof SwitchboardQueueVoterClient) {
      const props = await this.withUpdateVoterWeightRecord(
        instructions,
        tokeOwnerRecord,
        'castVote'
      )
      return props
    }
    if (this.client instanceof PythClient) {
      const props = await this.withUpdateVoterWeightRecord(
        instructions,
        tokeOwnerRecord,
        'castVote',
        proposal.pubkey
      )
      return props
    }

    if (this.client instanceof GatewayClient) {
      // get the gateway plugin vote instruction
      const instruction = await getVoteInstruction(
        this.client,
        this.gatewayToken,
        realm,
        walletPk
      )

      instructions.push(instruction)

      const { voterWeightPk } = await this._withHandleGatewayVoterWeight(
        realm!,
        walletPk,
        clientProgramId,
        instructions
      )

      return { voterWeightPk, maxVoterWeightRecord: undefined }
    }
  }
  withRelinquishVote = async (
    instructions,
    proposal: ProgramAccount<Proposal>,
    voteRecordPk: PublicKey
  ): Promise<ProgramAddresses | undefined> => {
    if (this.noClient) {
      return
    }
    const clientProgramId = this.client!.program.programId
    const realm = this.realm!
    const walletPk = this.walletPk!
    if (
      realm.account.communityMint.toBase58() !==
      proposal.account.governingTokenMint.toBase58()
    ) {
      return
    }

    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getPluginRegistrarPDA(
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
      const nftVoteRecordsFiltered = (
        await this.client.program.account.nftVoteRecord.all([
          {
            memcmp: {
              offset: 8,
              bytes: proposal.pubkey.toBase58(),
            },
          },
        ])
      ).filter(
        (x) => x.account.governingTokenOwner.toBase58() === walletPk.toBase58()
      )
      for (const voteRecord of nftVoteRecordsFiltered) {
        remainingAccounts.push(
          new AccountData(voteRecord.publicKey, false, true)
        )
      }

      const firstFiveNfts = remainingAccounts.slice(0, 5)
      const remainingNftsToChunk = remainingAccounts.slice(
        5,
        remainingAccounts.length
      )
      const nftsChunk = chunks(remainingNftsToChunk, 12)
      const relinquishNftVoteIx = await this.client.program.methods
        .relinquishNftVote()
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          governance: proposal.account.governance,
          proposal: proposal.pubkey,
          governingTokenOwner: walletPk,
          voteRecord: voteRecordPk,
          beneficiary: walletPk,
        })
        .remainingAccounts(firstFiveNfts)
        .instruction()
      instructions.push(relinquishNftVoteIx)
      for (const i of nftsChunk) {
        const relinquishNftVote2Ix = await this.client.program.methods
          .relinquishNftVote()
          .accounts({
            registrar,
            voterWeightRecord: voterWeightPk,
            governance: proposal.account.governance,
            proposal: proposal.pubkey,
            governingTokenOwner: walletPk,
            voteRecord: voteRecordPk,
            beneficiary: walletPk,
          })
          .remainingAccounts(i)
          .instruction()
        instructions.push(relinquishNftVote2Ix)
      }
      return { voterWeightPk, maxVoterWeightRecord }
    }
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
    const {
      voterWeightPk,
      voterWeightRecordBump,
    } = await getPluginVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      walletPk!,
      clientProgramId
    )

    const {
      maxVoterWeightRecord,
      maxVoterWeightRecordBump,
    } = await getPluginMaxVoterWeightRecord(
      realm!.pubkey,
      realm!.account.communityMint,
      clientProgramId
    )

    return {
      voterWeightPk,
      voterWeightRecordBump,
      maxVoterWeightRecord,
      maxVoterWeightRecordBump,
    }
  }

  // TODO: this can probably be merged with the nft voter plugin implementation
  _withHandleGatewayVoterWeight = async (
    realm: ProgramAccount<Realm>,
    walletPk: PublicKey,
    clientProgramId: PublicKey,
    _instructions
  ) => {
    if (!(this.client instanceof GatewayClient)) {
      throw 'Method only allowed for gateway client'
    }
    const {
      voterWeightPk,
      voterWeightRecordBump,
    } = await getPluginVoterWeightRecord(
      realm.pubkey,
      realm.account.communityMint,
      walletPk,
      clientProgramId
    )

    const previousVoterWeightPk = await getPreviousVotingWeightRecord(
      this.client,
      realm,
      walletPk
    )

    return {
      previousVoterWeightPk,
      voterWeightPk,
      voterWeightRecordBump,
    }
  }
  _setCurrentVoterNfts = (nfts: NFTWithMeta[]) => {
    this.votingNfts = nfts
  }
  _setCurrentVoterGatewayToken = (gatewayToken: PublicKey) => {
    this.gatewayToken = gatewayToken
  }
  _setOracles = (oracles: PublicKey[]) => {
    this.oracles = oracles
  }
  _setInstructions = (instructions: TransactionInstruction[]) => {
    this.instructions = instructions
  }
}
