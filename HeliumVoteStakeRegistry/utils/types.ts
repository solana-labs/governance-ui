import { IdlAccounts, IdlTypes } from '@project-serum/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'

export type Registrar = IdlAccounts<HeliumVoterStakeRegistry>['registrar']
export type Position = IdlAccounts<HeliumVoterStakeRegistry>['positionV0']
export type LockupKind = IdlTypes<HeliumVoterStakeRegistry>['LockupKind']
export type InitializePositionV0Args = IdlTypes<HeliumVoterStakeRegistry>['InitializePositionArgsV0']
