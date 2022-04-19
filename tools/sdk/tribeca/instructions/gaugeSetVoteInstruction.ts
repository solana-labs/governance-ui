import { PublicKey, TransactionInstruction } from '@solana/web3.js';
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration';

export async function gaugeSetVoteInstruction({
  weight,
  programs,
  gauge,
  authority,
  tribecaConfiguration,
}: {
  weight: number;
  programs: TribecaPrograms;
  gauge: PublicKey;
  authority: PublicKey;
  tribecaConfiguration: ATribecaConfiguration;
}): Promise<TransactionInstruction> {
  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority);

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow);

  const [gaugeVote] = await tribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge,
  );

  console.log('Gauge Set Vote', {
    escrow: escrow.toString(),
    gauge: gauge.toString(),
    gaugeVoter: gaugeVoter.toString(),
    gaugeVote: gaugeVote.toString(),
    gaugemeister: tribecaConfiguration.gaugemeister.toString(),
  });

  return programs.Gauge.instruction.gaugeSetVote(weight, {
    accounts: {
      escrow,
      gaugemeister: tribecaConfiguration.gaugemeister,
      gauge,
      gaugeVoter,
      gaugeVote,
      voteDelegate: authority,
    },
  });
}
