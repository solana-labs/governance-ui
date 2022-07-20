import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function prepareEpochGaugeVoterInstruction({
  programs,
  authority,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  authority: PublicKey;
  payer: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const {
    currentRewardsEpoch,
    locker,
  } = await tribecaConfiguration.fetchGaugemeister(programs.Gauge);

  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow);

  const [
    epochGaugeVoter,
    bump,
  ] = await tribecaConfiguration.findEpochGaugeVoterAddress(
    gaugeVoter,
    currentRewardsEpoch + 1,
  );

  return programs.Gauge.instruction.prepareEpochGaugeVoter(bump, {
    accounts: {
      gaugemeister: tribecaConfiguration.gaugemeister,
      locker,
      escrow,
      gaugeVoter,
      payer,
      systemProgram: SystemProgram.programId,
      epochGaugeVoter,
    },
  });
}
