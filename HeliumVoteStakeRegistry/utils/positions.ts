import { Program } from '@project-serum/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { Position } from '../utils/types'

export const getPositions = async (
  program: Program<HeliumVoterStakeRegistry>
): { positions: Position[] } => {
  // TODO get positions for realm/voter
  const positions = []

  return {
    positions,
  }
}
