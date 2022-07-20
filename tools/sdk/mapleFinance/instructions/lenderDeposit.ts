import { getATAAddress } from '@saberhq/token-utils';
import { SYSTEM_PROGRAM_ID } from '@solana/spl-governance';
import { TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token';
import {
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';

import { MapleFinancePrograms, MapleFinance, PoolName } from '../configuration';

export async function lenderDeposit({
  poolName,
  authority: lenderUser,
  programs,
  depositAmount,
  sourceAccount,
}: {
  poolName: PoolName;
  authority: PublicKey;
  programs: MapleFinancePrograms;
  depositAmount: u64;
  sourceAccount: PublicKey;
}): Promise<TransactionInstruction> {
  const {
    pool,
    globals,
    baseMint,
    poolLocker,
    sharesMint,
  } = MapleFinance.pools[poolName];

  const lender = await MapleFinance.findLenderAddress(poolName, lenderUser);
  const lockedShares = await MapleFinance.findLockedSharesAddress(lender);

  const lenderShares = await getATAAddress({
    mint: sharesMint,
    owner: lenderUser,
  });

  return programs.Syrup.instruction.lenderDeposit(depositAmount, {
    accounts: {
      lender,
      lenderUser,
      pool,
      globals,
      baseMint: baseMint.mint,
      poolLocker,
      sharesMint,
      lockedShares,
      lenderShares,
      lenderLocker: sourceAccount,
      systemProgram: SYSTEM_PROGRAM_ID,
      tokenProgram: TOKEN_PROGRAM_ID,
      rent: SYSVAR_RENT_PUBKEY,
    },
  });
}

export default lenderDeposit;
