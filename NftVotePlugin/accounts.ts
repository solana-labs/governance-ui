import { NftVoterClient } from '@utils/uiTypes/NftVoterClient'
import { PublicKey } from '@solana/web3.js'
export interface NftVoteRecord {
  account: {
    governingTokenOwner: PublicKey
    nftMint: PublicKey
    proposal: PublicKey
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
