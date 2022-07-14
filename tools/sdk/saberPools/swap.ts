import { BN } from '@project-serum/anchor';
import { swapInstruction } from '@saberhq/stableswap-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findATAAddrSync } from '@utils/ataTools';
import saberPoolsConfiguration, { Pool } from './configuration';

export type SwapSide = 'swapAforB' | 'swapBforA';

export async function swap({
  authority,
  pool,
  amountIn,
  minimumAmountOut,
  side,
}: {
  authority: PublicKey;
  pool: Pool;
  amountIn: BN;
  minimumAmountOut: BN;
  side: SwapSide;
}): Promise<TransactionInstruction> {
  const sellToken =
    side === 'swapAforB' ? pool.tokenAccountA : pool.tokenAccountB;
  const buyToken =
    side === 'swapAforB' ? pool.tokenAccountB : pool.tokenAccountA;

  const [userSource] = findATAAddrSync(authority, sellToken.tokenMint);
  const [userDestination] = findATAAddrSync(authority, buyToken.tokenMint);

  // Counter intuitive but poolSource = sellToken and poolDestination = buyToken
  const poolSource = sellToken.mint;
  const poolDestination = buyToken.mint;
  const adminDestination = buyToken.adminDestinationAccount;

  // TRICKS
  // Have to add manually the toBuffer method as it's required by the @saberhq/stableswap-sdk package
  // le = little endian
  // 8 = 8 bytes = 64 bits
  amountIn.toBuffer = () => amountIn.toArrayLike(Buffer, 'le', 8);
  minimumAmountOut.toBuffer = () =>
    minimumAmountOut.toArrayLike(Buffer, 'le', 8);

  return swapInstruction({
    config: {
      authority: pool.swapAccountAuthority,
      swapAccount: pool.swapAccount,
      swapProgramID: saberPoolsConfiguration.saberStableSwapProgramId,
      tokenProgramID: TOKEN_PROGRAM_ID,
    },
    userAuthority: authority,
    userSource,
    poolSource,
    poolDestination,
    userDestination,
    adminDestination,
    amountIn,
    minimumAmountOut,
  });
}
