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

  return programs.Gauge.instruction.resetEpochGaugeVoter({
    accounts: {
      gaugemeister: tribecaConfiguration.gaugemeister,
      locker: tribecaConfiguration.locker,
      escrow,
      gaugeVoter,
      epochGaugeVoter,
    },
  });
}
