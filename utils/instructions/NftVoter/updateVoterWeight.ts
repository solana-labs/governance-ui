import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { DasNftObject } from '@hooks/queries/digitalAssets'
import { fetchNFTbyMint } from '@hooks/queries/nft'
import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { PublicKey, TransactionInstruction } from '@solana/web3.js'
import { chunks } from '@utils/helpers'
import { getNftActionTicketProgramAddress } from 'NftVotePlugin/accounts'
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

export const getUpdateVoterWeightRecordInstruction = async (
  client: NftVoterClient,
  walletPk: PublicKey,
  registrar: PublicKey,
  voterWeightPk: PublicKey,
  votingNfts: DasNftObject[],
  type: UpdateVoterWeightRecordTypes
) => {
  console.log('getUpdateVoterWeightRecordInstruction')
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
      client.program.provider.connection,
      new PublicKey(nft.id)
    )

    remainingAccounts.push(
      new AccountData(tokenAccount),
      new AccountData(metadata?.result?.metadataAddress || '')
    )
  }
  const updateVoterWeightRecordIx = await (client.program as Program<NftVoter>).methods
    .updateVoterWeightRecord({ [type]: {} })
    .accounts({
      registrar: registrar,
      voterWeightRecord: voterWeightPk,
    })
    .remainingAccounts(remainingAccounts.slice(0, 10))
    .instruction()
  return updateVoterWeightRecordIx
}

export const getUpdateVoterWeightRecordInstructionV2 = async (
  client: NftVoterClient,
  walletPk: PublicKey,
  registrar: PublicKey,
  voterWeightPk: PublicKey,
  votingNfts: DasNftObject[],
  type: UpdateVoterWeightRecordTypes
) => {
  console.log('getUpdateVoterWeightRecordInstructionV2')
  const createNftTicketIxs: TransactionInstruction[] = []
  const ticketType = `nft-${type}-ticket`
  const firstTenNfts = votingNfts.slice(0, 10)
  const nftActionTicketAccounts: AccountData[] = []

  const nfts = firstTenNfts.filter((x) => !x.compression.compressed)
  const nftRemainingAccounts: AccountData[] = []
  const clientProgramId = client.program.programId
  for (const nft of nfts) {
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
      client.program.provider.connection,
      new PublicKey(nft.id)
    )
    nftRemainingAccounts.push(
      new AccountData(tokenAccount),
      new AccountData(metadata?.result?.metadataAddress || ''),
      new AccountData(nftActionTicket, false, true)
    )

    nftActionTicketAccounts.push(new AccountData(nftActionTicket, false, true))
  }

  const nftChunks = chunks(nftRemainingAccounts, 15)
  for (const chunk of [...nftChunks]) {
    createNftTicketIxs.push(
      await (client.program as Program<NftVoterV2>).methods
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

  const compressedNfts = firstTenNfts.filter((x) => x.compression.compressed)
  for (const cnft of compressedNfts) {
    const { nftActionTicket } = getNftActionTicketProgramAddress(
      ticketType,
      registrar,
      walletPk,
      cnft.id,
      clientProgramId
    )

    const { param, additionalAccounts } = await getCnftParamAndProof(
      client.program.provider.connection,
      cnft
    )
    const instruction = await (client.program as Program<NftVoterV2>).methods
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
    createNftTicketIxs.push(instruction)

    nftActionTicketAccounts.push(new AccountData(nftActionTicket, false, true))
  }

  const updateVoterWeightRecordIx = await (client.program as Program<NftVoterV2>).methods
    .updateVoterWeightRecord({ [type]: {} })
    .accounts({
      registrar: registrar,
      voterWeightRecord: voterWeightPk,
      payer: walletPk,
    })
    .remainingAccounts(nftActionTicketAccounts)
    .instruction()

  return { createNftTicketIxs, updateVoterWeightRecordIx }
}
