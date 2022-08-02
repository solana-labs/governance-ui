import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { closePositionIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import { findATAAddrSync } from '@utils/ataTools';

export async function whirlpoolClosePosition({
  whirlpool,
  authority,
  position,
  receiver,
}: {
  whirlpool: WhirlpoolImpl;
  authority: PublicKey;
  position: PublicKey;
  receiver: PublicKey;
}): Promise<TransactionInstruction> {
  const positionData = await whirlpool.fetcher.getPosition(position, false);

  if (!positionData) {
    throw new Error(
      `Cannot find the position data at address ${position.toBase58()}`,
    );
  }

  const { positionMint } = positionData;

  const [positionTokenAccount] = findATAAddrSync(
    authority,
    positionData.positionMint,
  );

  const closePositionInstruction = closePositionIx(whirlpool.ctx.program, {
    receiver,
    position,
    positionMint,
    positionTokenAccount,
    positionAuthority: authority,
  });

  if (closePositionInstruction.instructions.length !== 1) {
    throw new Error('closePositionIx created more than one instruction');
  }

  // @tricks the increaseLiquidityIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [ix] = closePositionInstruction.instructions;

  return ix;
}
