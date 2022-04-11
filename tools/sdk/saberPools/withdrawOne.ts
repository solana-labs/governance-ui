import { BN } from '@project-serum/anchor';
import { withdrawOneInstruction } from '@saberhq/stableswap-sdk';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { findAssociatedTokenAddress } from '@utils/associated';
import saberPoolsConfiguration, { Pool } from './configuration';

export async function withdrawOne({
  authority,
  pool,
  destinationAccount,
  baseTokenName,
  poolTokenAmount,
  minimumTokenAmount,
}: {
  authority: PublicKey;
  pool: Pool;
  destinationAccount: PublicKey;
  baseTokenName: string;
  poolTokenAmount: BN;
  minimumTokenAmount: BN;
}): Promise<TransactionInstruction> {
  const poolTokenMintATA = await findAssociatedTokenAddress(
    authority,
    pool.poolToken.mint,
  );

  // TRICKS
  // Have to add manually the toBuffer method as it's required by the @saberhq/stableswap-sdk package
  // le = little endian
  // 8 = 8 bytes = 64 bits
  poolTokenAmount.toBuffer = () => poolTokenAmount.toArrayLike(Buffer, 'le', 8);
  minimumTokenAmount.toBuffer = () =>
    minimumTokenAmount.toArrayLike(Buffer, 'le', 8);

  // Depending on the token we withdraw (tokenA or tokenB) then it changes the base/quote/admin mints
  let baseTokenAccount = pool.tokenAccountA.mint;
  let quoteTokenAccount = pool.tokenAccountB.mint;
  let adminDestinationAccount = pool.tokenAccountA.adminDestinationAccount;

  if (baseTokenName === pool.tokenAccountB.name) {
    baseTokenAccount = pool.tokenAccountB.mint;
    quoteTokenAccount = pool.tokenAccountA.mint;
    adminDestinationAccount = pool.tokenAccountB.adminDestinationAccount;
  }

  console.log('Withdraw One', {
    config: {
      authority: pool.swapAccountAuthority.toString(),
      swapAccount: pool.swapAccount.toString(),
      swapProgramID: saberPoolsConfiguration.saberStableSwapProgramId.toString(),
      tokenProgramID: TOKEN_PROGRAM_ID.toString(),
    },
    userAuthority: authority.toString(),
    poolMint: pool.poolToken.mint.toString(),
    sourceAccount: poolTokenMintATA.toString(),
    baseTokenAccount: baseTokenAccount.toString(),
    quoteTokenAccount: quoteTokenAccount.toString(),
    destinationAccount: destinationAccount.toString(),
    adminDestinationAccount: adminDestinationAccount.toString(),
    poolTokenAmount: poolTokenAmount.toString(),
    minimumTokenAmount: minimumTokenAmount.toString(),
  });

  return withdrawOneInstruction({
    config: {
      authority: pool.swapAccountAuthority,
      swapAccount: pool.swapAccount,
      swapProgramID: saberPoolsConfiguration.saberStableSwapProgramId,
      tokenProgramID: TOKEN_PROGRAM_ID,
    },
    userAuthority: authority,
    poolMint: pool.poolToken.mint,
    sourceAccount: poolTokenMintATA,
    baseTokenAccount,
    quoteTokenAccount,
    destinationAccount,
    adminDestinationAccount,
    poolTokenAmount,
    minimumTokenAmount,
  });
}
