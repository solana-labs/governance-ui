import {
  findHoldingPDA,
  findVaultPDA,
  findVestingPDA,
} from '@soceanfi/bonding';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { EndpointTypes } from '@models/types';
import { BondingProgram } from '../programs';
import soceanConfiguration from '../configuration';

const INDEX_MAGIC_NUMBER = 0;

export async function cancelVest({
  cluster,
  program,
  refundRentTo,
  authority,
  bondPool,
  bondedMint,
  userBondedAccount,
  userTargetAccount,
}: {
  cluster: EndpointTypes;
  program: BondingProgram;
  refundRentTo: PublicKey;
  authority: PublicKey;
  bondPool: PublicKey;
  bondedMint: PublicKey;
  userBondedAccount: PublicKey;
  userTargetAccount: PublicKey;
}): Promise<TransactionInstruction> {
  const bondingProgramId = soceanConfiguration.bondingProgramId[cluster];

  if (!bondingProgramId) {
    throw new Error(
      'unsupported cluster to create mintBondedTokens instruction',
    );
  }

  const [[vault], [vesting]] = await Promise.all([
    findVaultPDA(bondingProgramId, bondPool),
    findVestingPDA(bondingProgramId, bondPool, authority, INDEX_MAGIC_NUMBER),
  ]);

  const [holding] = await findHoldingPDA(bondingProgramId, vesting);

  return program.instruction.cancelVest({
    accounts: {
      refundRentTo,
      user: authority,
      userBondedAccount,
      userTargetAccount,
      vesting,
      bondPool,
      bondedMint,
      holding,
      vault,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
  });
}
