import { BN } from '@project-serum/anchor';
import { findHoldingPDA, findVestingPDA } from '@soceanfi/bonding';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { EndpointTypes } from '@models/types';

import soceanConfiguration from '../configuration';
import { BondingProgram } from '../programs';

const INDEX_MAGIC_NUMBER = 0;

export async function vest({
  cluster,
  program,
  payer,
  authority,
  bondPool,
  bondedMint,
  userBondedAccount,
  amount,
}: {
  cluster: EndpointTypes;
  program: BondingProgram;
  payer: PublicKey;
  authority: PublicKey;
  bondPool: PublicKey;
  bondedMint: PublicKey;
  userBondedAccount: PublicKey;
  amount: BN;
}): Promise<TransactionInstruction> {
  const bondingProgramId = soceanConfiguration.bondingProgramId[cluster];

  if (!bondingProgramId) {
    throw new Error(
      'unsupported cluster to create mintBondedTokens instruction',
    );
  }

  const [vesting, vestingBump] = await findVestingPDA(
    bondingProgramId,
    bondPool,
    authority,
    INDEX_MAGIC_NUMBER,
  );
  const [holding, holdingBump] = await findHoldingPDA(
    bondingProgramId,
    vesting,
  );

  return program.instruction.vest(
    INDEX_MAGIC_NUMBER,
    vestingBump,
    holdingBump,
    amount,
    {
      accounts: {
        payer,
        user: authority,
        userBondedAccount,
        vesting,
        holding,
        bondedMint,
        bondPool,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: SYSVAR_RENT_PUBKEY,
      },
    },
  );
}
