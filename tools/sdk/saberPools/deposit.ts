import { BN } from '@project-serum/anchor';
import { depositInstruction } from '@saberhq/stableswap-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findAssociatedTokenAddress } from '@utils/associated';
import { findATAAddrSync } from '@utils/ataTools';
import saberPoolsConfiguration, { Pool } from './configuration';

export async function deposit({
  authority,
  pool,
  tokenAmountA,
  tokenAmountB,
  minimumPoolTokenAmount,
}: {
  authority: PublicKey;
  pool: Pool;
  tokenAmountA: BN;
  tokenAmountB: BN;
  minimumPoolTokenAmount: BN;
}): Promise<TransactionInstruction> {
  const poolTokenMintATA = await findAssociatedTokenAddress(
    authority,
    pool.poolToken.mint,
  );

  const [sourceA] = findATAAddrSync(authority, pool.tokenAccountA.tokenMint);
  const [sourceB] = findATAAddrSync(authority, pool.tokenAccountB.tokenMint);

  // TRICKS
  // Have to add manually the toBuffer method as it's required by the @saberhq/stableswap-sdk package
  // le = little endian
  // 8 = 8 bytes = 64 bits
  tokenAmountA.toBuffer = () => tokenAmountA.toArrayLike(Buffer, 'le', 8);
  tokenAmountB.toBuffer = () => tokenAmountB.toArrayLike(Buffer, 'le', 8);
  minimumPoolTokenAmount.toBuffer = () =>
    minimumPoolTokenAmount.toArrayLike(Buffer, 'le', 8);

  return depositInstruction({
    config: {
      authority: pool.swapAccountAuthority,
      swapAccount: pool.swapAccount,
      swapProgramID: saberPoolsConfiguration.saberStableSwapProgramId,
      tokenProgramID: TOKEN_PROGRAM_ID,
    },
    userAuthority: authority,
    sourceA,
    sourceB,
    tokenAccountA: pool.tokenAccountA.mint,
    tokenAccountB: pool.tokenAccountB.mint,
    poolTokenMint: pool.poolToken.mint,
    poolTokenAccount: poolTokenMintATA,
    tokenAmountA,
    tokenAmountB,
    minimumPoolTokenAmount,
  });
}
