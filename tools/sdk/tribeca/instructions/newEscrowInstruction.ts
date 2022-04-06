import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration'

export async function newEscrowInstruction({
  programs,
  authority,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms
  authority: PublicKey
  payer: PublicKey
  tribecaConfiguration: ATribecaConfiguration
}): Promise<TransactionInstruction> {
  const [escrow, bump] = await tribecaConfiguration.findEscrowAddress(authority)

  return programs.LockedVoter.instruction.newEscrow(bump, {
    accounts: {
      escrow,
      payer,
      locker: tribecaConfiguration.locker,
      escrowOwner: authority,
      systemProgram: SystemProgram.programId,
    },
  })
}
