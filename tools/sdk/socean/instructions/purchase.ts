import { BN } from '@project-serum/anchor';
import {
  findAuctionAuthority,
  findAuctionPool,
} from '@soceanfi/descending-auction';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { EndpointTypes } from '@models/types';
import soceanConfiguration from '../configuration';
import { DescendingAuctionProgram } from '../programs';

export async function purchase({
  cluster,
  program,
  auction,
  bondedMint,
  paymentDestination,
  buyer,
  paymentSource,
  saleDestination,
  purchaseAmount,
  expectedPayment,
  slippageTolerance,
}: {
  cluster: EndpointTypes;
  program: DescendingAuctionProgram;
  auction: PublicKey;
  bondedMint: PublicKey;
  paymentDestination: PublicKey;
  buyer: PublicKey;
  paymentSource: PublicKey;
  saleDestination: PublicKey;
  purchaseAmount: BN;
  expectedPayment: BN;
  slippageTolerance: BN;
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

  return program.instruction.purchase(
    purchaseAmount,
    expectedPayment,
    slippageTolerance,
    {
      accounts: {
        auction,
        auctionAuthority,
        saleMint: bondedMint,
        auctionPool,
        paymentDestination,
        buyer,
        paymentSource,
        saleDestination,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    },
  );
}
