import { IdlAccounts, Program } from '@project-serum/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'

export type Position = IdlAccounts<HeliumVoterStakeRegistry>['positionV0']
export const getPositions = async (
  program: Program<HeliumVoterStakeRegistry>
): { positions: Position[] } => {
  // TODO get positions for realm/voter
  const positions = []

  return {
    positions,
  }
}
