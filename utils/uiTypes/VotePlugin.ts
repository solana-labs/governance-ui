import { GatewayClient } from '@solana/governance-program-library'

import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
  Proposal,
  TokenOwnerRecord,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { chunks } from '@utils/helpers'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { NFTWithMint } from './nfts'
import { DasNftObject } from '@hooks/queries/digitalAssets'
import {
  getPreviousVotingWeightRecord,
  getVoteInstruction,
} from '../../GatewayPlugin/sdk/accounts'
import {
  getVoterWeightRecord as getPluginVoterWeightRecord,
  getRegistrarPDA as getPluginRegistrarPDA,
  getMaxVoterWeightRecord as getPluginMaxVoterWeightRecord,
} from '@utils/plugin/accounts'
import { VsrClient } from 'VoteStakeRegistry/sdk/client'
import {
  // getNftVoteRecordProgramAddress,
  getUsedNftsForProposal,
} from 'NftVotePlugin/accounts'
import { PositionWithMeta } from 'HeliumVotePlugin/sdk/types'
import { HeliumVsrClient } from 'HeliumVotePlugin/sdk/client'
import {
  nftVoteRecordKey,
  registrarKey,
  voterWeightRecordKey,
  maxVoterWeightRecordKey,
} from '@helium/voter-stake-registry-sdk'
import { getUnusedPositionsForProposal } from 'HeliumVotePlugin/utils/getUnusedPositionsForProposal'
import { getUsedPositionsForProposal } from 'HeliumVotePlugin/utils/getUsedPositionsForProposal'
import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { NftVoterClient } from './NftVoterClient'
import queryClient from '@hooks/queries/queryClient'
import asFindable from '@utils/queries/asFindable'
import { ON_NFT_VOTER_V2 } from '@constants/flags'
// import { fetchNFTbyMint } from '@hooks/queries/nft'
import {
  getUpdateVoterWeightRecordInstruction,
  getUpdateVoterWeightRecordInstructionV2,
  // getUpdateVoterWeightRecordV2Instruction,
} from '@utils/instructions/NftVoter/updateVoterWeight'
import {
  getCastNftVoteInstruction,
  getCastNftVoteInstructionV2,
} from '@utils/instructions/NftVoter/castNftVote'

type UpdateVoterWeightRecordTypes =
  | 'castVote'
  | 'commentProposal'
  | 'createGovernance'
  | 'createProposal'
  | 'signOffProposal'

export interface VotingClientProps {
  client: Client | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
}

export interface NFTWithMeta extends NFTWithMint {
  getAssociatedTokenAccount(): Promise<string>
}

export enum VotingClientType {
  NoClient,
  VsrClient,
  HeliumVsrClient,
  NftVoterClient,
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

export type Client =
  | VsrClient
  | HeliumVsrClient
  | NftVoterClient
  | GatewayClient

//Abstract for common functions that plugins will implement
export class VotingClient {
  client: Client | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
  votingNfts: DasNftObject[]
  heliumVsrVotingPositions: PositionWithMeta[]
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
    this.heliumVsrVotingPositions = []
    this.oracles = []
    this.instructions = []
    this.noClient = true
    this.clientType = VotingClientType.NoClient
    if (this.client instanceof VsrClient) {
      this.clientType = VotingClientType.VsrClient
      this.noClient = false
    }
    if (this.client instanceof HeliumVsrClient) {
      this.clientType = VotingClientType.HeliumVsrClient
      this.noClient = false
    }
    if (this.client instanceof NftVoterClient) {
      this.clientType = VotingClientType.NftVoterClient
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
  }
  withUpdateVoterWeightRecord = async (
    instructions: TransactionInstruction[],
    tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
    type: UpdateVoterWeightRecordTypes,
    createNftActionTicketIxs?: TransactionInstruction[]
  ): Promise<ProgramAddresses | undefined> => {
    const realm = this.realm!

    if (
      this.noClient ||
      !realm.account.communityMint.equals(
        tokenOwnerRecord.account.governingTokenMint
      )
    ) {
      return
    }
    const clientProgramId = this.client!.program.programId
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

    if (this.client instanceof HeliumVsrClient) {
      const remainingAccounts: AccountData[] = []
      const [registrar] = registrarKey(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )

      for (const pos of this.heliumVsrVotingPositions) {
        const tokenAccount = await getAssociatedTokenAddress(pos.mint, walletPk)

        remainingAccounts.push(
          new AccountData(tokenAccount),
          new AccountData(pos.pubkey)
        )
      }

      const [voterWeightPk] = voterWeightRecordKey(
        registrar,
        walletPk,
        clientProgramId
      )

      const [maxVoterWeightPk] = maxVoterWeightRecordKey(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )

      instructions.push(
        await (this.client as HeliumVsrClient).program.methods
          .updateVoterWeightRecordV0({
            owner: walletPk,
            voterWeightAction: {
              [type]: {},
            },
          } as any)
          .accounts({
            registrar,
            voterWeightRecord: voterWeightPk,
            voterTokenOwnerRecord: tokenOwnerRecord.pubkey,
          })
          .remainingAccounts(remainingAccounts.slice(0, 10))
          .instruction()
      )

      return {
        voterWeightPk,
        maxVoterWeightRecord: maxVoterWeightPk,
      }
    }

    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getPluginRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
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

      if (!ON_NFT_VOTER_V2) {
        const updateVoterWeightRecordIx = await getUpdateVoterWeightRecordInstruction(
          this.client,
          walletPk,
          registrar,
          voterWeightPk,
          this.votingNfts,
          type
        )
        instructions.push(updateVoterWeightRecordIx)
      } else {
        const {
          createNftTicketIxs,
          updateVoterWeightRecordIx,
        } = await getUpdateVoterWeightRecordInstructionV2(
          this.client,
          walletPk,
          registrar,
          voterWeightPk,
          this.votingNfts,
          type
        )
        createNftActionTicketIxs?.push(...createNftTicketIxs)
        instructions.push(updateVoterWeightRecordIx)
      }

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
  }
  withCastPluginVote = async (
    instructions: TransactionInstruction[],
    proposal: ProgramAccount<Proposal>,
    tokenOwnerRecord: ProgramAccount<TokenOwnerRecord>,
    createNftActionTicketIxs?: TransactionInstruction[]
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

    if (this.client instanceof VsrClient) {
      const props = await this.withUpdateVoterWeightRecord(
        instructions,
        tokenOwnerRecord,
        'castVote'
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
        realm,
        walletPk,
        clientProgramId,
        instructions
      )

      return { voterWeightPk, maxVoterWeightRecord: undefined }
    }

    if (this.client instanceof HeliumVsrClient) {
      const remainingAccounts: AccountData[] = []

      const [registrar] = registrarKey(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )

      const unusedPositions = await getUnusedPositionsForProposal({
        connection: this.client.program.provider.connection,
        client: this.client,
        positions: this.heliumVsrVotingPositions,
        proposalPk: proposal.pubkey,
      })

      const [voterWeightPk] = voterWeightRecordKey(
        registrar,
        walletPk,
        clientProgramId
      )

      const [maxVoterWeightPk] = maxVoterWeightRecordKey(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )

      for (let i = 0; i < unusedPositions.length; i++) {
        const pos = unusedPositions[i]
        const tokenAccount = await getAssociatedTokenAddress(pos.mint, walletPk)
        const [nftVoteRecord] = nftVoteRecordKey(
          proposal.pubkey,
          pos.mint,
          clientProgramId
        )

        remainingAccounts.push(
          new AccountData(tokenAccount),
          new AccountData(pos.pubkey, false, true),
          new AccountData(nftVoteRecord, false, true)
        )
      }

      //1 nft is 3 accounts
      const positionChunks = chunks(remainingAccounts, 9)
      for (const chunk of positionChunks) {
        instructions.push(
          await this.client.program.methods
            .castVoteV0({
              proposal: proposal.pubkey,
              owner: walletPk,
            })
            .accounts({
              registrar,
              voterTokenOwnerRecord: tokenOwnerRecord.pubkey,
            })
            .remainingAccounts(chunk)
            .instruction()
        )
      }

      return {
        voterWeightPk,
        maxVoterWeightRecord: maxVoterWeightPk,
      }
    }

    if (this.client instanceof NftVoterClient) {
      const { registrar } = await getPluginRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        this.client.program.programId
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

      const nftVoteRecordsFiltered = await getUsedNftsForProposal(
        this.client,
        proposal.pubkey
      )
      if (!ON_NFT_VOTER_V2) {
        const castNftVoteIxs = await getCastNftVoteInstruction(
          this.client,
          walletPk,
          registrar,
          proposal.pubkey,
          tokenOwnerRecord.pubkey,
          voterWeightPk,
          this.votingNfts,
          nftVoteRecordsFiltered
        )
        instructions.push(...castNftVoteIxs)
      } else {
        const {
          castNftVoteTicketIxs,
          castNftVoteIxs,
        } = await getCastNftVoteInstructionV2(
          this.client,
          walletPk,
          registrar,
          proposal.pubkey,
          tokenOwnerRecord.pubkey,
          voterWeightPk,
          this.votingNfts,
          nftVoteRecordsFiltered
        )
        createNftActionTicketIxs?.push(...castNftVoteTicketIxs)
        instructions.push(...castNftVoteIxs)
      }

      return { voterWeightPk, maxVoterWeightRecord }
    }
  }
  withRelinquishVote = async (
    instructions,
    proposal: ProgramAccount<Proposal>,
    voteRecordPk: PublicKey,
    tokenOwnerRecord: PublicKey
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

    if (this.client instanceof HeliumVsrClient) {
      const remainingAccounts: AccountData[] = []
      const [registrar] = registrarKey(
        realm.pubkey,
        realm.account.communityMint,
        clientProgramId
      )

      const [voterWeightPk] = voterWeightRecordKey(
        registrar,
        walletPk,
        clientProgramId
      )

      const usedPositions = await getUsedPositionsForProposal({
        connection: this.client.program.provider.connection,
        client: this.client,
        positions: this.heliumVsrVotingPositions,
        proposalPk: proposal.pubkey,
      })

      for (let i = 0; i < usedPositions.length; i++) {
        const pos = usedPositions[i]
        const [nftVoteRecord] = nftVoteRecordKey(
          proposal.pubkey,
          pos.mint,
          clientProgramId
        )

        remainingAccounts.push(
          new AccountData(nftVoteRecord, false, true),
          new AccountData(pos.pubkey, false, true)
        )
      }

      const firstFivePositions = remainingAccounts.slice(0, 10)
      const remainingPositionsChunk = chunks(
        remainingAccounts.slice(10, remainingAccounts.length),
        12
      )

      for (const chunk of [firstFivePositions, ...remainingPositionsChunk]) {
        instructions.push(
          await this.client.program.methods
            .relinquishVoteV0()
            .accounts({
              registrar,
              voterTokenOwnerRecord: tokenOwnerRecord,
              proposal: proposal.pubkey,
              governance: proposal.account.governance,
              voterWeightRecord: voterWeightPk,
              voteRecord: voteRecordPk,
              beneficiary: walletPk,
            })
            .remainingAccounts(chunk)
            .instruction()
        )
      }

      return {
        voterWeightPk,
        maxVoterWeightRecord: undefined,
      }
    }

    if (this.client instanceof NftVoterClient) {
      const remainingAccounts: AccountData[] = []
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
      const nftVoteRecordsFiltered = (
        await getUsedNftsForProposal(this.client, proposal.pubkey)
      ).filter(
        (x) => x.account.governingTokenOwner.toBase58() === walletPk.toBase58()
      )
      for (const voteRecord of nftVoteRecordsFiltered) {
        remainingAccounts.push(
          new AccountData(voteRecord.publicKey, false, true)
        )
      }
      const connection = this.client.program.provider.connection

      // if this was good code, this would appear outside of this fn.
      // But we're not writing good code, there's no good place for it, I'm not bothering.
      const voterWeightRecord = await queryClient.fetchQuery({
        queryKey: [voterWeightPk],
        queryFn: () =>
          asFindable(connection.getAccountInfo, connection)(voterWeightPk),
      })

      if (voterWeightRecord.result) {
        const firstFiveNfts = remainingAccounts.slice(0, 5)
        const remainingNftsChunk = chunks(
          remainingAccounts.slice(5, remainingAccounts.length),
          12
        )

        for (const chunk of [firstFiveNfts, ...remainingNftsChunk]) {
          instructions.push(
            await this.client.program.methods
              .relinquishNftVote()
              .accounts({
                registrar,
                voterWeightRecord: voterWeightPk,
                governance: proposal.account.governance,
                proposal: proposal.pubkey,
                voterTokenOwnerRecord: tokenOwnerRecord,
                voterAuthority: walletPk,
                voteRecord: voteRecordPk,
                beneficiary: walletPk,
              })
              .remainingAccounts(chunk)
              .instruction()
          )
        }
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
  _setCurrentVoterNfts = (nfts: DasNftObject[]) => {
    this.votingNfts = nfts
  }
  _setCurrentHeliumVsrPositions = (positions: PositionWithMeta[]) => {
    this.heliumVsrVotingPositions = positions
  }
  _setCurrentVoterGatewayToken = (gatewayToken: PublicKey) => {
    this.gatewayToken = gatewayToken
  }
  _setInstructions = (instructions: TransactionInstruction[]) => {
    this.instructions = instructions
  }
}
