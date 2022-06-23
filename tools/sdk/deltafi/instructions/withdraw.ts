import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, { PoolInfo } from '../configuration';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { findATAAddrSync } from '@utils/ataTools';

export default async function withdraw({
  deltafiProgram,
  authority,
  poolInfo,
  baseShare,
  quoteShare,
  minBaseAmount,
  minQuoteAmount,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  poolInfo: PoolInfo;
  minBaseAmount: BN;
  minQuoteAmount: BN;
  baseShare: BN;
  quoteShare: BN;
}) {
  const [userTokenBase] = findATAAddrSync(authority, poolInfo.mintBase);
  const [userTokenQuote] = findATAAddrSync(authority, poolInfo.mintQuote);

  const [
    {
      tokenBase,
      tokenQuote,
      adminFeeTokenBase,
      adminFeeTokenQuote,
      pythPriceBase,
      pythPriceQuote,
      swapType,
    },

    [lpPublicKey],
  ] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findLiquidityProviderAddress({
      poolInfo,
      authority,
    }),
  ]);

  const withdrawAccounts = {
    swapInfo: poolInfo.swapInfo,
    userTokenBase,
    userTokenQuote,
    quoteSourceRef: userTokenQuote,
    liquidityProvider: lpPublicKey,
    tokenBase: tokenBase,
    tokenQuote: tokenQuote,
    adminFeeTokenBase: adminFeeTokenBase,
    adminFeeTokenQuote: adminFeeTokenQuote,
    pythPriceBase: pythPriceBase,
    pythPriceQuote: pythPriceQuote,
    userAuthority: authority,
    tokenProgram: TOKEN_PROGRAM_ID,
  };

  // TRICKS
  // Have to cast the swapType value as it's supposed to be an enum, but it's not
  const swapTypeCast = swapType as {
    stableSwap?: unknown;
    normalSwap?: unknown;
    serumSwap?: unknown;
  };

  if (swapTypeCast.stableSwap) {
    return deltafiProgram.instruction.withdrawFromStableSwap(
      baseShare,
      quoteShare,
      minBaseAmount,
      minQuoteAmount,
      {
        accounts: withdrawAccounts,
      },
    );
  }

  if (swapTypeCast.normalSwap) {
    return deltafiProgram.instruction.withdrawFromNormalSwap(
      baseShare,
      quoteShare,
      minBaseAmount,
      minQuoteAmount,
      {
        accounts: withdrawAccounts,
      },
    );
  }

  if (swapTypeCast.serumSwap) {
    throw new Error('Unhandled swap type');
  }

  throw new Error('Unknown swap type');
}
