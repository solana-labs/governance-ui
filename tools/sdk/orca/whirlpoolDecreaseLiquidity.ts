import {
  decreaseLiquidityQuoteByLiquidity,
  PDAUtil,
  WhirlpoolClient,
} from '@orca-so/whirlpools-sdk';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { decreaseLiquidityIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';
import { Percentage } from '@orca-so/sdk';
import { u64 } from '@solana/spl-token';

export async function whirlpoolDecreaseLiquidity({
  whirlpool,
  authority,
  liquidityAmountToDecrease,
  uiSlippage,
  position,
  whirlpoolClient,
}: {
  whirlpool: WhirlpoolImpl;
  authority: PublicKey;
  liquidityAmountToDecrease: number;
  uiSlippage: number;
  position: PublicKey;
  whirlpoolClient: WhirlpoolClient;
}): Promise<TransactionInstruction> {
  if (uiSlippage < 0 || uiSlippage > 100) {
    throw new Error('Slippage must be between 0 and 100 included');
  }

  const {
    tickSpacing,
    tokenMintA,
    tokenMintB,
    tokenVaultA,
    tokenVaultB,
  } = whirlpool.getData();

  const positionObj = await whirlpoolClient.getPosition(position, true);

  if (!positionObj) {
    throw new Error(
      `Cannot find the position data at address ${position.toBase58()}`,
    );
  }

  const {
    tickLowerIndex,
    tickUpperIndex,
    positionMint,
  } = positionObj.getData();

  const tickArrayLowerPda = PDAUtil.getTickArrayFromTickIndex(
    tickLowerIndex,
    tickSpacing,
    whirlpool.address,
    whirlpool.ctx.program.programId,
  );

  const tickArrayUpperPda = PDAUtil.getTickArrayFromTickIndex(
    tickUpperIndex,
    tickSpacing,
    whirlpool.address,
    whirlpool.ctx.program.programId,
  );

  const {
    tokenMinA,
    tokenMinB,
    liquidityAmount,
  } = await decreaseLiquidityQuoteByLiquidity(
    new u64(liquidityAmountToDecrease),
    Percentage.fromFraction(new u64(uiSlippage), new u64(100)),
    positionObj,
    whirlpool,
  );

  const [
    [positionTokenAccount],
    [tokenOwnerAccountA],
    [tokenOwnerAccountB],
  ] = findMultipleATAAddSync(authority, [positionMint, tokenMintA, tokenMintB]);

  const decreaseLiquidityInstruction = decreaseLiquidityIx(
    whirlpool.ctx.program,
    {
      tokenMinA,
      tokenMinB,
      liquidityAmount,
      whirlpool: whirlpool.address,
      position,
      positionTokenAccount,
      tokenOwnerAccountA,
      tokenOwnerAccountB,
      tokenVaultA,
      tokenVaultB,
      tickArrayLower: tickArrayLowerPda.publicKey,
      tickArrayUpper: tickArrayUpperPda.publicKey,
      positionAuthority: authority,
    },
  );

  if (decreaseLiquidityInstruction.instructions.length !== 1) {
    throw new Error('decreaseLiquidityIx created more than one instruction');
  }

  // @tricks the decreaseLiquidityIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [ix] = decreaseLiquidityInstruction.instructions;

  return ix;
}
