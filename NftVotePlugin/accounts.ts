import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { PublicKey } from '@solana/web3.js'
import { BN } from '@coral-xyz/anchor'
import { NftVoterV2 } from 'idls/nft_voter_v2'
import { Program } from '@project-serum/anchor'

export interface NftVoteRecord {
  account: {
    governingTokenOwner: PublicKey
    nftMint: PublicKey
    proposal: PublicKey
  }
  publicKey: PublicKey
}

export interface NftActionTicket {
  account: {
    nft_owner: PublicKey
    weight: BN
  }
  publicKey: PublicKey
}

export const getUsedNftsForProposal = async (
  client: NftVoterClient,
  proposalPk: PublicKey
) => {
  const nftVoteRecordsFiltered = (await client.program.account.nftVoteRecord.all(
    [
      {
        memcmp: {
          offset: 8,
          bytes: proposalPk.toBase58(),
        },
      },
    ]
  )) as NftVoteRecord[]
  return nftVoteRecordsFiltered
}

export const getNftVoteRecordProgramAddress = async (
  proposalPk: PublicKey,
  nftMintAddress: string,
  clientProgramId: PublicKey
) => {
  const [nftVoteRecord, nftVoteRecordBump] = await PublicKey.findProgramAddress(
    [
      Buffer.from('nft-vote-record'),
      proposalPk.toBuffer(),
      new PublicKey(nftMintAddress).toBuffer(),
    ],
    clientProgramId
  )

  return {
    nftVoteRecord,
    nftVoteRecordBump,
  }
}

export const getNftActionTicketsForVoter = async (
  client: NftVoterClient,
  registrar: PublicKey,
  voter: PublicKey
) => {
  const nftActionTicketsFiltered = ((await (client.program as Program<NftVoterV2>).account.nftActionTicket.all(
    [
      {
        memcmp: {
          offset: 8,
          bytes: registrar.toBase58(),
        },
      },
      {
        memcmp: {
          offset: 40,
          bytes: voter.toBase58(),
        },
      },
    ]
  )) as unknown) as NftActionTicket[]
  return nftActionTicketsFiltered
}

export const getNftActionTicketProgramAddress = async (
  ticketType: string,
  registrar: PublicKey,
  owner: PublicKey,
  nftMintAddress: string,
  clientProgramId: PublicKey
) => {
  const [
    nftActionTicket,
    nftActionTicketBump,
  ] = await PublicKey.findProgramAddress(
    [
      Buffer.from(ticketType),
      registrar.toBuffer(),
      owner.toBuffer(),
      new PublicKey(nftMintAddress).toBuffer(),
    ],
    clientProgramId
  )

  return {
    nftActionTicket,
    nftActionTicketBump,
  }
}
