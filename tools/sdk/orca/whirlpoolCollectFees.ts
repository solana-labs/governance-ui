import { PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';
import { collectFeesIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import { findMultipleATAAddSync } from '@uxd-protocol/uxd-client';

export async function whirlpoolCollectFees({
  whirlpool,
  position,
  authority,
}: {
  whirlpool: WhirlpoolImpl;
  position: PublicKey;
  authority: PublicKey;
}): Promise<TransactionInstruction> {
  const positionData = await whirlpool.fetcher.getPosition(position, false);

  if (!positionData) {
    throw new Error(
      `Cannot find the position data at address ${position.toBase58()}`,
    );
  }

  const {
    tokenMintA,
    tokenMintB,
    tokenVaultA,
    tokenVaultB,
  } = whirlpool.getData();

  const [
    [positionTokenAccount],
    [tokenOwnerAccountA],
    [tokenOwnerAccountB],
  ] = findMultipleATAAddSync(authority, [
    positionData.positionMint,
    tokenMintA,
    tokenMintB,
  ]);

  const collectFeesInstruction = collectFeesIx(whirlpool.ctx.program, {
    position,
    whirlpool: whirlpool.address,
    positionTokenAccount,
    tokenOwnerAccountA,
    tokenOwnerAccountB,
    tokenVaultA,
    tokenVaultB,
    positionAuthority: authority,
  });

  if (collectFeesInstruction.instructions.length !== 1) {
    throw new Error('updateFeesAndRewardsIx created more than one instruction');
  }

  // @tricks the collectFeesIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [ix] = collectFeesInstruction.instructions;

  return ix;
}
