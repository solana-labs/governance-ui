import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import ATribecaConfiguration, {
  TribecaPrograms,
} from '../ATribecaConfiguration'

export async function gaugeCommitVoteInstruction({
  programs,
  gauge,
  authority,
  payer,
  tribecaConfiguration,
}: {
  programs: TribecaPrograms
  gauge: PublicKey
  authority: PublicKey
  payer: PublicKey
  tribecaConfiguration: ATribecaConfiguration
}): Promise<TransactionInstruction> {
  const { currentRewardsEpoch } = await tribecaConfiguration.fetchGaugemeister(
    programs.Gauge
  )

  const [escrow] = await tribecaConfiguration.findEscrowAddress(authority)

  const [gaugeVoter] = await tribecaConfiguration.findGaugeVoterAddress(escrow)

  const [gaugeVote] = await tribecaConfiguration.findGaugeVoteAddress(
    gaugeVoter,
    gauge
  )

  const votingEpoch = currentRewardsEpoch + 1

  const [epochGauge] = await tribecaConfiguration.findEpochGaugeAddress(
    gauge,
    votingEpoch
  )

  const [
    epochGaugeVoter,
  ] = await tribecaConfiguration.findEpochGaugeVoterAddress(
    gaugeVoter,
    votingEpoch
  )

  const [
    epochGaugeVote,
    voteBump,
  ] = await tribecaConfiguration.findEpochGaugeVoteAddress(
    gaugeVote,
    votingEpoch
  )

  return programs.Gauge.instruction.gaugeCommitVote(voteBump, {
    accounts: {
      gaugemeister: ATribecaConfiguration.gaugemeister,
      gauge,
      gaugeVoter,
      gaugeVote,
      payer,
      systemProgram: SystemProgram.programId,
      epochGauge,
      epochGaugeVoter,
      epochGaugeVote,
    },
  })
}
