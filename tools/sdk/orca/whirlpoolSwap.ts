import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { swapIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import {
  PDAUtil,
  swapQuoteByInputToken,
  swapQuoteByOutputToken,
} from '@orca-so/whirlpools-sdk';
import { u64 } from '@solana/spl-token';
import { Percentage } from '@orca-so/sdk';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import { uiAmountToNativeBN } from '../units';

export async function whirlpoolSwap({
  whirlpool,
  uiSlippage,
  authority,
  ...amount
}: {
  whirlpool: WhirlpoolImpl;
  uiSlippage: number;
  authority: PublicKey;
} & (
  | {
      inputTokenMint: PublicKey;
      uiAmountOfInputTokenToSwap: number;
    }
  | {
      outputTokenMint: PublicKey;
      uiAmountOfOutputTokenToReceive: number;
    }
)): Promise<TransactionInstruction> {
  if (uiSlippage < 0 || uiSlippage > 100) {
    throw new Error('Slippage must be between 0 and 100 included');
  }

  const {
    tokenMintA,
    tokenMintB,
    tokenVaultA,
    tokenVaultB,
  } = whirlpool.getData();

  const getSwapQuote = async () => {
    if ('uiAmountOfInputTokenToSwap' in amount && 'inputTokenMint' in amount) {
      const inputTokenDecimals = whirlpool.tokenAInfo.mint.equals(
        amount.inputTokenMint,
      )
        ? whirlpool.tokenAInfo.decimals
        : whirlpool.tokenBInfo.decimals;

      const amountOfInputTokenToSwap = uiAmountToNativeBN(
        amount.uiAmountOfInputTokenToSwap,
        inputTokenDecimals,
      );

      return swapQuoteByInputToken(
        whirlpool,
        amount.inputTokenMint,
        new u64(amountOfInputTokenToSwap),
        Percentage.fromFraction(new u64(uiSlippage), new u64(100)),
        whirlpool.ctx.program.programId,
        whirlpool.fetcher,
        true,
      );
    }

    if (
      'uiAmountOfOutputTokenToReceive' in amount &&
      'outputTokenMint' in amount
    ) {
      const outputTokenDecimals = whirlpool.tokenAInfo.mint.equals(
        amount.outputTokenMint,
      )
        ? whirlpool.tokenAInfo.decimals
        : whirlpool.tokenBInfo.decimals;

      const amountOfOutputTokenToReceive = uiAmountToNativeBN(
        amount.uiAmountOfOutputTokenToReceive,
        outputTokenDecimals,
      );

      return swapQuoteByOutputToken(
        whirlpool,
        amount.outputTokenMint,
        new u64(amountOfOutputTokenToReceive),
        Percentage.fromFraction(new u64(uiSlippage), new u64(100)),
        whirlpool.ctx.program.programId,
        whirlpool.fetcher,
        true,
      );
    }

    throw new Error('Invalid swap parameters');
  };

  const swapQuote = await getSwapQuote();

  const [
    [tokenOwnerAccountA],
    [tokenOwnerAccountB],
  ] = findMultipleATAAddSync(authority, [tokenMintA, tokenMintB]);

  const oraclePda = PDAUtil.getOracle(
    whirlpool.ctx.program.programId,
    whirlpool.address,
  );

  const swapInstruction = swapIx(whirlpool.ctx.program, {
    tokenOwnerAccountA,
    tokenVaultA,
    tokenOwnerAccountB,
    tokenVaultB,
    whirlpool: whirlpool.address,
    tokenAuthority: authority,
    oracle: oraclePda.publicKey,
    ...swapQuote,
  });

  if (swapInstruction.instructions.length !== 1) {
    throw new Error('closePositionIx created more than one instruction');
  }

  // @tricks the swapIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [ix] = swapInstruction.instructions;

  return ix;
}
