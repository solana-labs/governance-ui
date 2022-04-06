import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from '@solana/web3.js'
import ATribecaConfiguration from '../ATribecaConfiguration'
import { TribecaPrograms } from '../ATribecaConfiguration'

export async function createEpochGaugeInstruction({
  programs,
  gauge,
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

  const votingEpoch = currentRewardsEpoch + 1

  const [epochGauge, bump] = await tribecaConfiguration.findEpochGaugeAddress(
    gauge,
    votingEpoch
  )

  return programs.Gauge.instruction.createEpochGauge(bump, votingEpoch, {
    accounts: {
      epochGauge,
      gauge,
      payer,
      systemProgram: SystemProgram.programId,
    },
  })
}
export default createEpochGaugeInstruction
