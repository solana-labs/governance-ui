import { PDAUtil } from '@orca-so/whirlpools-sdk';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { updateFeesAndRewardsIx } from '@orca-so/whirlpools-sdk/dist/instructions';

export async function whirlpoolUpdateFeesAndRewards({
  whirlpool,
  position,
}: {
  whirlpool: WhirlpoolImpl;
  position: PublicKey;
}): Promise<TransactionInstruction> {
  const positionData = await whirlpool.fetcher.getPosition(position, false);

  if (!positionData) {
    throw new Error(
      `Cannot find the position data at address ${position.toBase58()}`,
    );
  }

  const { tickLowerIndex, tickUpperIndex } = positionData;

  const { tickSpacing } = whirlpool.getData();

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

  const updateFeesAndRewardsInstruction = updateFeesAndRewardsIx(
    whirlpool.ctx.program,
    {
      whirlpool: whirlpool.address,
      position,
      tickArrayLower: tickArrayLowerPda.publicKey,
      tickArrayUpper: tickArrayUpperPda.publicKey,
    },
  );

  if (updateFeesAndRewardsInstruction.instructions.length !== 1) {
    throw new Error('updateFeesAndRewardsIx created more than one instruction');
  }

  // @tricks the updateFeesAndRewardsIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [ix] = updateFeesAndRewardsInstruction.instructions;

  return ix;
}
