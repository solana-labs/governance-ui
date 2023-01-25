import { IdlAccounts, IdlTypes } from '@project-serum/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { TokenProgramAccount } from '@utils/tokens'
import { MintInfo } from '@solana/spl-token'

export type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T // from lodash
export const truthy = <T>(value: T): value is Truthy<T> => !!value

export type VotingMintConfig = IdlTypes<HeliumVoterStakeRegistry>['VotingMintConfigV0']
type RegistrarV0 = IdlAccounts<HeliumVoterStakeRegistry>['registrar']
type Lockup = IdlTypes<HeliumVoterStakeRegistry>['Lockup']
type PositionV0 = IdlAccounts<HeliumVoterStakeRegistry>['positionV0']
export interface Registrar extends RegistrarV0 {
  votingMints: VotingMintConfig[]
}
export interface Position extends Omit<PositionV0, 'lockup'> {
  lockup: Lockup
}
export interface PositionWithVotingMint extends Position {
  votingMint: VotingMintConfig & {
    mint: TokenProgramAccount<MintInfo>
  }
}
export type LockupKind = IdlTypes<HeliumVoterStakeRegistry>['LockupKind']
export type InitializePositionV0Args = IdlTypes<HeliumVoterStakeRegistry>['InitializePositionArgsV0']
