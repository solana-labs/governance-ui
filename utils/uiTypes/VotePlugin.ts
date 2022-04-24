import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import { NftVoterClient } from '@solana/governance-program-library'
import {
  ProgramAccount,
  Realm,
  SYSTEM_PROGRAM_ID,
  Proposal,
} from '@solana/spl-governance'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { chunks } from '@utils/helpers'
import {
  getNftRegistrarPDA,
  getNftVoterWeightRecord,
  getNftMaxVoterWeightRecord,
} from 'NftVotePlugin/sdk/accounts'
import {
  getRegistrarPDA,
  getVoterPDA,
  getVoterWeightPDA,
} from 'VoteStakeRegistry/sdk/accounts'
import { NFTWithMint } from './nfts'

type UpdateVoterWeightRecordTypes =
  | 'castVote'
  | 'commentProposal'
  | 'createGovernance'
  | 'createProposal'
  | 'signOffProposal'

export interface VotingClientProps {
  client: VsrClient | NftVoterClient | undefined
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
    type: UpdateVoterWeightRecordTypes
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
            remainingAccounts: remainingAccounts.splice(0, 10),
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
          new AccountData(nftVoteRecord, false, true)
        )
      }
      if (remainingAccounts.length / 3 > 5) {
        const nftsChunk = chunks(remainingAccounts, 15).reverse()
        for (const i of nftsChunk) {
          instructions.push(
            this.client.program.instruction.castNftVote(proposalPk, {
              accounts: {
                registrar,
                voterWeightRecord: voterWeightPk,
                governingTokenOwner: walletPk,
                payer: walletPk,
                systemProgram: SYSTEM_PROGRAM_ID,
              },
              remainingAccounts: i,
            })
          )
        }
      } else {
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
    proposal: ProgramAccount<Proposal>,
    voteRecordPk: PublicKey
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
            proposal.pubkey.toBuffer(),
            new PublicKey(nft.metadata.data.mint).toBuffer(),
          ],
          clientProgramId
        )
        remainingAccounts.push(new AccountData(nftVoteRecord, false, true))
      }

      if (remainingAccounts.length > 10) {
        const nftsChunk = chunks(remainingAccounts, 10).reverse()
        for (const i of nftsChunk) {
          instructions.push(
            this.client.program.instruction.relinquishNftVote({
              accounts: {
                registrar,
                voterWeightRecord: voterWeightPk,
                governance: proposal.account.governance,
                proposal: proposal.pubkey,
                governingTokenOwner: walletPk,
                voteRecord: voteRecordPk,
                beneficiary: walletPk,
              },
              remainingAccounts: i,
            })
          )
        }
      } else {
        instructions.push(
          this.client.program.instruction.relinquishNftVote({
            accounts: {
              registrar,
              voterWeightRecord: voterWeightPk,
              governance: proposal.account.governance,
              proposal: proposal.pubkey,
              governingTokenOwner: walletPk,
              voteRecord: voteRecordPk,
              beneficiary: walletPk,
            },
            remainingAccounts: remainingAccounts,
          })
        )
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
