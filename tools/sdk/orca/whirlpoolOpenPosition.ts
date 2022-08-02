import { PDAUtil, TickUtil } from '@orca-so/whirlpools-sdk';
import { Keypair, PublicKey, TransactionInstruction } from '@solana/web3.js';

// Have to get this version of the whirlpool so we can use its attributes
import { WhirlpoolImpl } from '@orca-so/whirlpools-sdk/dist/impl/whirlpool-impl';

import { findATAAddrSync } from '@utils/ataTools';
import { openPositionWithMetadataIx } from '@orca-so/whirlpools-sdk/dist/instructions';
import { notify } from '@utils/notifications';

export async function whirlpoolOpenPosition({
  whirlpool,
  tickLower,
  tickUpper,
  authority,
  payer,
}: {
  whirlpool: WhirlpoolImpl;
  tickLower: number;
  tickUpper: number;
  authority: PublicKey;
  payer: PublicKey;
}): Promise<{
  position: PublicKey;
  ix: TransactionInstruction;
}> {
  if (!TickUtil.checkTickInBounds(tickLower)) {
    throw new Error('tickLower is out of bounds.');
  }

  if (!TickUtil.checkTickInBounds(tickUpper)) {
    throw new Error('tickUpper is out of bounds.');
  }

  const { tickSpacing } = whirlpool.getData();

  if (!TickUtil.isTickInitializable(tickLower, tickSpacing)) {
    throw new Error(
      `lower tick ${tickLower} is not an initializable tick for tick-spacing ${tickSpacing}`,
    );
  }

  if (!TickUtil.isTickInitializable(tickUpper, tickSpacing)) {
    throw new Error(
      `upper tick ${tickUpper} is not an initializable tick for tick-spacing ${tickSpacing}`,
    );
  }

  // A new LP token is created specifically for the new position
  const positionMintKeypair = Keypair.generate();

  const { publicKey: positionMint } = positionMintKeypair;

  console.info(
    'Position mint secret key (Copy it! You need it to execute the proposal!)',
    `[${positionMintKeypair.secretKey.toString()}]`,
  );

  notify({
    type: 'info',
    message: `Position mint secret key (Copy it! You need it to execute the proposal!)`,
    description: `[${positionMintKeypair.secretKey.toString()}]`,
  });

  const positionPda = PDAUtil.getPosition(
    whirlpool.ctx.program.programId,
    positionMint,
  );

  const metadataPda = PDAUtil.getPositionMetadata(positionMint);
  const [positionTokenAccount] = findATAAddrSync(authority, positionMint);

  const positionInstruction = openPositionWithMetadataIx(
    whirlpool.ctx.program,
    {
      funder: payer,
      owner: authority,
      positionPda,
      metadataPda,
      positionMintAddress: positionMint,
      positionTokenAccount,
      whirlpool: whirlpool.address,
      tickLowerIndex: tickLower,
      tickUpperIndex: tickUpper,
    },
  );

  if (positionInstruction.instructions.length !== 1) {
    throw new Error(
      'openPositionWithMetadataIx created more than one instruction',
    );
  }

  // @tricks the openPositionWithMetadataIx returns an Instruction type when we want a TransactionInstruction
  // because we know the Instruction only contains one instruction, we extract it manually
  const [positionIx] = positionInstruction.instructions;

  return {
    position: positionPda.publicKey,
    ix: positionIx,
  };
}
