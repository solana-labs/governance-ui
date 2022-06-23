import { BN } from '@project-serum/anchor';
import { PublicKey } from '@solana/web3.js';
import { DeltafiProgram } from '../program/deltafi';
import deltafiConfiguration, { PoolInfo } from '../configuration';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { findATAAddrSync } from '@utils/ataTools';

export default async function deposit({
  deltafiProgram,
  authority,
  poolInfo,
  baseAmount,
  quoteAmount,
  minBaseShare,
  minQuoteShare,
}: {
  deltafiProgram: DeltafiProgram;
  authority: PublicKey;
  poolInfo: PoolInfo;
  baseAmount: BN;
  quoteAmount: BN;
  minBaseShare: BN;
  minQuoteShare: BN;
}) {
  const [userTokenBase] = findATAAddrSync(authority, poolInfo.mintBase);
  const [userTokenQuote] = findATAAddrSync(authority, poolInfo.mintQuote);

  const [
    { tokenBase, tokenQuote, pythPriceBase, pythPriceQuote, swapType },

    [lpPublicKey],
  ] = await Promise.all([
    deltafiProgram.account.swapInfo.fetch(poolInfo.swapInfo),

    deltafiConfiguration.findLiquidityProviderAddress({
      poolInfo,
      authority,
    }),
  ]);

  const depositAccounts = {
    swapInfo: poolInfo.swapInfo,
    userTokenBase,
    userTokenQuote,
    quoteSourceRef: userTokenQuote,
    liquidityProvider: lpPublicKey,
    tokenBase,
    tokenQuote,
    pythPriceBase,
    pythPriceQuote,
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
    return deltafiProgram.instruction.depositToStableSwap(
      baseAmount,
      quoteAmount,
      minBaseShare,
      minQuoteShare,
      {
        accounts: depositAccounts,
      },
    );
  }

  if (swapTypeCast.normalSwap) {
    return deltafiProgram.instruction.depositToNormalSwap(
      baseAmount,
      quoteAmount,
      minBaseShare,
      minQuoteShare,
      {
        accounts: depositAccounts,
      },
    );
  }

  if (swapTypeCast.serumSwap) {
    throw new Error('Unhandled swap type');
  }

  throw new Error('Unknown swap type');
}
