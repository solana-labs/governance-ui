import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function resetEpochGaugeVoterInstruction({
  programs,
  authority,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms;
  authority: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const { currentRewardsEpoch } = await tribecaConfiguration.fetchGaugemeister(
    programs.Gauge,
  );

  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow);

  const votingEpoch = currentRewardsEpoch + 1;

  const [
    epochGaugeVoter,
  ] = await tribecaConfiguration.findEpochGaugeVoterAddress(
    gaugeVoter,
    votingEpoch,
  );

  console.log('Reset Epoch Gauge Voter', {
    gaugemeister: ATribecaConfiguration.gaugemeister.toString(),
    locker: tribecaConfiguration.locker.toString(),
    escrow: escrow.toString(),
    gaugeVoter: gaugeVoter.toString(),
    epochGaugeVoter: epochGaugeVoter.toString(),
  });

  return programs.Gauge.instruction.resetEpochGaugeVoter({
    accounts: {
      gaugemeister: ATribecaConfiguration.gaugemeister,
      locker: tribecaConfiguration.locker,
      escrow,
      gaugeVoter,
      epochGaugeVoter,
    },
  });
}
