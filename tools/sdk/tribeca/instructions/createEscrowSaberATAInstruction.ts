import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import { createAssociatedTokenAccount } from '@utils/associated';
import { LockerData } from '../programs/lockedVoter';
import ATribecaConfiguration from '../ATribecaConfiguration';

export async function createEscrowATAInstruction({
  lockerData,
  authority,
  payer,
  tribecaConfiguration,
}: {
  lockerData: LockerData;
  authority: PublicKey;
  payer: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [tx] = await createAssociatedTokenAccount(
    payer,
    escrow,
    lockerData.tokenMint,
  );

  return tx;
}
