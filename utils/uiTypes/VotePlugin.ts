import {ProgramAccount, Proposal, Realm, VoterWeightAction,} from '@solana/spl-governance'
import {PublicKey, TransactionInstruction} from '@solana/web3.js'
import {chunks} from '@utils/helpers'
import {
  getRegistrarPDA as getPluginRegistrarPDA,
} from '@utils/plugin/accounts'
import {getUsedNftsForProposal} from 'NftVotePlugin/accounts'
import {PositionWithMeta} from 'HeliumVotePlugin/sdk/types'
import {
  nftVoteRecordKey,
  registrarKey,
} from '@helium/voter-stake-registry-sdk'
import {getUnusedPositionsForProposal} from 'HeliumVotePlugin/utils/getUnusedPositionsForProposal'
import {getUsedPositionsForProposal} from 'HeliumVotePlugin/utils/getUsedPositionsForProposal'
import {getAssociatedTokenAddress} from '@blockworks-foundation/mango-v4'
import queryClient from '@hooks/queries/queryClient'
import asFindable from '@utils/queries/asFindable'
import {UseVoterWeightPluginsReturnType} from "../../VoterWeightPlugins/useVoterWeightPlugins";
import {convertTypeToVoterWeightAction} from "../../VoterWeightPlugins";
import {Client} from "@solana/governance-program-library";
import {NftVoterClient} from "@utils/uiTypes/NftVoterClient";
import {HeliumVsrClient} from "../../HeliumVotePlugin/sdk/client";

export type UpdateVoterWeightRecordTypes =
  | 'castVote'
  | 'commentProposal'
  | 'createGovernance'
  | 'createProposal'
  | 'signOffProposal'

export interface VotingClientProps {
  client: Client<any> | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
  voterWeightPluginDetails: UseVoterWeightPluginsReturnType
}

export enum VotingClientType {
  NoClient,
  VsrClient,
  HeliumVsrClient,
  NftVoterClient,
}

export class AccountData {
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
  client: Client<any> | undefined
  realm: ProgramAccount<Realm> | undefined
  walletPk: PublicKey | null | undefined
  heliumVsrVotingPositions: PositionWithMeta[]
  oracles: PublicKey[]
  instructions: TransactionInstruction[]
  clientType: VotingClientType
  noClient: boolean
  voterWeightPluginDetails: UseVoterWeightPluginsReturnType
  constructor({ client, realm, walletPk, voterWeightPluginDetails }: VotingClientProps) {
    this.client = client
    this.realm = realm
    this.walletPk = walletPk
    this.heliumVsrVotingPositions = []
    this.oracles = []
    this.instructions = []
    this.noClient = true
    this.clientType = VotingClientType.NoClient
    this.voterWeightPluginDetails = voterWeightPluginDetails
    if (this.client instanceof HeliumVsrClient) {
      this.clientType = VotingClientType.HeliumVsrClient
      this.noClient = false
    }
    if (this.client instanceof NftVoterClient) {
      this.clientType = VotingClientType.NftVoterClient
      this.noClient = false
    }
  }
  withUpdateVoterWeightRecord = async (
    instructions: TransactionInstruction[],
    type: UpdateVoterWeightRecordTypes,
    createNftActionTicketIxs?: TransactionInstruction[],
  ): Promise<ProgramAddresses | undefined> => {
    const {pre: preIxes, post: postIxes} = await this.voterWeightPluginDetails.updateVoterWeightRecords(convertTypeToVoterWeightAction(type))
    instructions.push(...preIxes);
    createNftActionTicketIxs?.push(...postIxes);

    return { voterWeightPk: this.voterWeightPluginDetails.voterWeightPk, maxVoterWeightRecord: this.voterWeightPluginDetails.maxVoterWeightPk }
  }

  withCastPluginVote = async (
    instructions: TransactionInstruction[],
    proposal: ProgramAccount<Proposal>,
    tokenOwnerRecord: PublicKey,
    createNftActionTicketIxs?: TransactionInstruction[]
  ): Promise<ProgramAddresses | undefined> => {
    const updateVoterWeightRecordIxes = await this.voterWeightPluginDetails.updateVoterWeightRecords(VoterWeightAction.CastVote);
    const { voterWeightPk, maxVoterWeightPk } = this.voterWeightPluginDetails;
    instructions.push(...updateVoterWeightRecordIxes.pre);
    createNftActionTicketIxs?.push(...updateVoterWeightRecordIxes.post || []);

    const clientProgramId = this.client?.program.programId
    const realm = this.realm
    const walletPk = this.walletPk

    if (
        !realm || !walletPk ||
      realm.account.communityMint.toBase58() !==
      proposal.account.governingTokenMint.toBase58()
    ) {
      return
    }

    // the helium client needs to add some additional accounts to the transaction
    if (clientProgramId && this.client instanceof HeliumVsrClient) {
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

      for (let i = 0; i < unusedPositions.length; i++) {
        const pos = unusedPositions[i]
        const tokenAccount = await getAssociatedTokenAddress(
          pos.mint,
          walletPk,
          true
        )
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
              voterTokenOwnerRecord: tokenOwnerRecord,
            })
            .remainingAccounts(chunk)
            .instruction()
        )
      }
    }

    return {
      voterWeightPk,
      maxVoterWeightRecord: maxVoterWeightPk,
    }
  }
  withRelinquishVote = async (
    instructions: TransactionInstruction[],
    proposal: ProgramAccount<Proposal>,
    voteRecordPk: PublicKey,
    tokenOwnerRecord: PublicKey
  ): Promise<ProgramAddresses | undefined> => {
    if (this.noClient) {
      return
    }
    const clientProgramId = this.client?.program.programId
    const realm = this.realm
    const walletPk = this.walletPk

    const {
      voterWeightPk,
      maxVoterWeightPk: maxVoterWeightRecord,
    } = this.voterWeightPluginDetails;

    if (
        !realm || !walletPk || !voterWeightPk || !clientProgramId ||
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
        maxVoterWeightRecord,
      }
    }

    if (this.client instanceof NftVoterClient) {
      const remainingAccounts: AccountData[] = []
      const { registrar } = await getPluginRegistrarPDA(
        realm.pubkey,
        realm.account.communityMint,
        this.client.program.programId
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


  _setCurrentHeliumVsrPositions = (positions: PositionWithMeta[]) => {
    this.heliumVsrVotingPositions = positions
  }
}
