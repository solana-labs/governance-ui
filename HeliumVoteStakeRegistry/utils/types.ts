import { IdlAccounts, IdlTypes } from '@project-serum/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'

export type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T // from lodash
export const truthy = <T>(value: T): value is Truthy<T> => !!value
export type VotingMintConfig = IdlTypes<HeliumVoterStakeRegistry>['VotingMintConfigV0']
export type Registrar = IdlAccounts<HeliumVoterStakeRegistry>['registrar'] & {
  votingMints: VotingMintConfig[]
}
export type Position = IdlAccounts<HeliumVoterStakeRegistry>['positionV0']
export type LockupKind = IdlTypes<HeliumVoterStakeRegistry>['LockupKind']
export type InitializePositionV0Args = IdlTypes<HeliumVoterStakeRegistry>['InitializePositionArgsV0']
