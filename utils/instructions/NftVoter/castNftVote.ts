import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { DasNftObject } from '@hooks/queries/digitalAssets'
import { fetchNFTbyMint } from '@hooks/queries/nft'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { chunks } from '@utils/helpers'
import {
  NftVoteRecord,
  getNftActionTicketProgramAddress,
  getNftVoteRecordProgramAddress,
} from 'NftVotePlugin/accounts'
import { PROGRAM_ID as ACCOUNT_COMPACTION_PROGRAM_ID } from '@solana/spl-account-compression'
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance'
import { NftVoter } from 'idls/nft_voter'
import { NftVoterV2 } from 'idls/nft_voter_v2'
import { Program } from '@project-serum/anchor'
import {
  AccountData,
  UpdateVoterWeightRecordTypes,
} from '@utils/uiTypes/VotePlugin'
import { getCnftParamAndProof } from 'NftVotePlugin/getCnftParamAndProof'

export const getCastNftVoteInstruction = async (
  program: Program<NftVoter>,
  walletPk: PublicKey,
  registrar: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  voterWeightPk: PublicKey,
  votingNfts: DasNftObject[],
  nftVoteRecordsFiltered: NftVoteRecord[]
) => {
  console.log('getCastNftVoteInstruction')
  const clientProgramId = program.programId
  const remainingAccounts: AccountData[] = []
  for (let i = 0; i < votingNfts.length; i++) {
    const nft = votingNfts[i]
    // const tokenAccount = await nft.getAssociatedTokenAccount()
    const tokenAccount = await getAssociatedTokenAddress(
      new PublicKey(nft.id),
      walletPk,
      true
    )
    const metadata = await fetchNFTbyMint(
      program.provider.connection,
      new PublicKey(nft.id)
    )
    const { nftVoteRecord } = await getNftVoteRecordProgramAddress(
      proposal,
      nft.id,
      clientProgramId
    )
    if (
      !nftVoteRecordsFiltered.find(
        (x) => x.publicKey.toBase58() === nftVoteRecord.toBase58()
      )
    )
      remainingAccounts.push(
        new AccountData(tokenAccount),
        new AccountData(metadata?.result?.metadataAddress || ''),
        new AccountData(nftVoteRecord, false, true)
      )
  }

  const castNftVoteIxs: TransactionInstruction[] = []
  //1 nft is 3 accounts
  const nftChunks = chunks(remainingAccounts, 12)
  for (const chunk of [...nftChunks]) {
    castNftVoteIxs.push(
      await program.methods
        .castNftVote(proposal)
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          voterTokenOwnerRecord: tokenOwnerRecord,
          voterAuthority: walletPk,
          payer: walletPk,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts(chunk)
        .instruction()
    )
  }
  return castNftVoteIxs
}

export const getCastNftVoteInstructionV2 = async (
  program: Program<NftVoterV2>,
  walletPk: PublicKey,
  registrar: PublicKey,
  proposal: PublicKey,
  tokenOwnerRecord: PublicKey,
  voterWeightPk: PublicKey,
  votingNfts: DasNftObject[],
  nftVoteRecordsFiltered: NftVoteRecord[]
) => {
  console.log('getCastNftVoteInstructionV2')
  const clientProgramId = program.programId
  const castNftVoteTicketIxs: TransactionInstruction[] = []
  const castVoteRemainingAccounts: AccountData[] = []
  const type: UpdateVoterWeightRecordTypes = 'castVote'
  const ticketType = `nft-${type}-ticket`
  // create nft weight records for all nfts
  const nfts = votingNfts.filter((x) => !x.compression.compressed)
  const nftRemainingAccounts: AccountData[] = []
  for (const nft of nfts) {
    const { nftVoteRecord } = await getNftVoteRecordProgramAddress(
      proposal,
      nft.id,
      clientProgramId
    )
    if (
      !nftVoteRecordsFiltered.find(
        (x) => x.publicKey.toBase58() === nftVoteRecord.toBase58()
      )
    ) {
      const { nftActionTicket } = getNftActionTicketProgramAddress(
        ticketType,
        registrar,
        walletPk,
        nft.id,
        clientProgramId
      )

      const tokenAccount = await getAssociatedTokenAddress(
        new PublicKey(nft.id),
        walletPk,
        true
      )
      const metadata = await fetchNFTbyMint(
        program.provider.connection,
        new PublicKey(nft.id)
      )

      nftRemainingAccounts.push(
        new AccountData(tokenAccount),
        new AccountData(metadata?.result?.metadataAddress || ''),
        new AccountData(nftActionTicket, false, true)
      )

      castVoteRemainingAccounts.push(
        new AccountData(nftActionTicket, false, true),
        new AccountData(nftVoteRecord, false, true)
      )
    }
  }

  const createNftVoteTicketChunks = chunks(nftRemainingAccounts, 15)
  for (const chunk of [...createNftVoteTicketChunks]) {
    castNftVoteTicketIxs.push(
      await program.methods
        .createNftActionTicket({ [type]: {} })
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          voterAuthority: walletPk,
          payer: walletPk,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts(chunk)
        .instruction()
    )
  }

  // create nft weight record for all compressed nfts
  const cnfts = votingNfts.filter((x) => x.compression.compressed)
  for (const cnft of cnfts) {
    const { nftVoteRecord } = await getNftVoteRecordProgramAddress(
      proposal,
      cnft.id,
      clientProgramId
    )
    if (
      !nftVoteRecordsFiltered.find(
        (x) => x.publicKey.toBase58() === nftVoteRecord.toBase58()
      )
    ) {
      const { nftActionTicket } = getNftActionTicketProgramAddress(
        ticketType,
        registrar,
        walletPk,
        cnft.id,
        clientProgramId
      )

      const { param, additionalAccounts } = await getCnftParamAndProof(
        program.provider.connection,
        cnft
      )

      const instruction = await program.methods
        .createCnftActionTicket({ [type]: {} }, [param])
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          payer: walletPk,
          compressionProgram: ACCOUNT_COMPACTION_PROGRAM_ID,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts([
          ...additionalAccounts.map((x) => new AccountData(x)),
          new AccountData(nftActionTicket, false, true),
        ])
        .instruction()
      castNftVoteTicketIxs.push(instruction)

      castVoteRemainingAccounts.push(
        new AccountData(nftActionTicket, false, true),
        new AccountData(nftVoteRecord, false, true)
      )
    }
  }

  const castNftVoteIxs: TransactionInstruction[] = []
  const castVoteRemainingAccountsChunks = chunks(castVoteRemainingAccounts, 12)
  for (const chunk of [...castVoteRemainingAccountsChunks]) {
    castNftVoteIxs.push(
      await program.methods
        .castNftVote(proposal)
        .accounts({
          registrar,
          voterWeightRecord: voterWeightPk,
          voterTokenOwnerRecord: tokenOwnerRecord,
          voterAuthority: walletPk,
          payer: walletPk,
          systemProgram: SYSTEM_PROGRAM_ID,
        })
        .remainingAccounts(chunk)
        .instruction()
    )
  }

  return { castNftVoteTicketIxs, castNftVoteIxs }
}
