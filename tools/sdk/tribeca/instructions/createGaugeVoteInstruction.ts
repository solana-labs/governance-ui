import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function createGaugeVoteInstruction({
  programs,
  gauge,
  authority,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  gauge: PublicKey;
  authority: PublicKey;
  payer: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow);

  const [gaugeVote, bump] = await tribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge,
  );

  return programs.Gauge.instruction.createGaugeVote(bump, {
    accounts: {
      gaugeVoter,
      gaugeVote,
      gauge,
      payer,
      systemProgram: SystemProgram.programId,
    },
  });
}
