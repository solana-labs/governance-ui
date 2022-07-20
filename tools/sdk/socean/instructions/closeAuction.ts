import {
  findAuctionAuthority,
  findAuctionPool,
} from '@soceanfi/descending-auction';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { EndpointTypes } from '@models/types';
import soceanConfiguration from '../configuration';
import { DescendingAuctionProgram } from '../programs/descendingAuction';

export async function closeAuction({
  cluster,
  program,
  auction,
  authority,
  bondedMint,
  destinationAccount,
}: {
  cluster: EndpointTypes;
  program: DescendingAuctionProgram;
  auction: PublicKey;
  authority: PublicKey;
  bondedMint: PublicKey;
  destinationAccount: PublicKey;
}): Promise<TransactionInstruction> {
  const descendingAuctionProgramId =
    soceanConfiguration.descendingAuctionProgramId[cluster];

  if (!descendingAuctionProgramId) {
    throw new Error('unsupported cluster to create closeAuction instruction');
  }

  const [[auctionAuthority], [auctionPool]] = await Promise.all([
    findAuctionAuthority(descendingAuctionProgramId, auction),
    findAuctionPool(descendingAuctionProgramId, auction, bondedMint),
  ]);

  return program.instruction.closeAuction({
    accounts: {
      auction,
      auctionPool,
      auctionAuthority,
      authority,
      destinationAccount,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}
