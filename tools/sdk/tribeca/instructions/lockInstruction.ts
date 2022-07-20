import { BN } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  PublicKey,
  SYSVAR_INSTRUCTIONS_PUBKEY,
  TransactionInstruction,
} from '@solana/web3.js';
import { getATAAddress } from '@saberhq/token-utils';
import { LockerData } from '../programs';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';
import { DEFAULT_GOVERNANCE_PROGRAM_ID } from '@components/instructions/tools';

export async function lockInstruction({
  programs,
  lockerData,
  authority,
  amount,
  durationSeconds,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  lockerData: LockerData;
  authority: PublicKey;
  amount: BN;
  durationSeconds: BN;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const {
    tokens: escrowTokens,
    owner: escrowOwner,
  } = await programs.LockedVoter.account.escrow.fetch(escrow);

  const sourceTokens = await getATAAddress({
    mint: tribecaConfiguration.token.mint,
    owner: escrowOwner,
  });

  const [whitelistEntry] = await tribecaConfiguration.findWhitelistAddress(
    tribecaConfiguration.locker,
    new PublicKey(DEFAULT_GOVERNANCE_PROGRAM_ID),
    authority,
  );

  return programs.LockedVoter.instruction.lock(amount, durationSeconds, {
    accounts: {
      locker: tribecaConfiguration.locker,
      escrow,
      escrowOwner,
      escrowTokens,
      sourceTokens,
      tokenProgram: TOKEN_PROGRAM_ID,
    },
    remainingAccounts: lockerData.params.whitelistEnabled
      ? [
          {
            pubkey: SYSVAR_INSTRUCTIONS_PUBKEY,
            isSigner: false,
            isWritable: false,
          },
          {
            pubkey: whitelistEntry,
            isSigner: false,
            isWritable: false,
          },
        ]
      : [],
  });
}
