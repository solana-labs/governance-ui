import { PublicKey } from '@solana/web3.js'
import { BN, IdlAccounts, IdlTypes } from '@coral-xyz/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { HeliumSubDaos } from '@helium/idls/lib/types/helium_sub_daos'
import { TokenProgramAccount } from '@utils/tokens'
import { MintInfo } from '@solana/spl-token'
import { Sft } from '@metaplex-foundation/js'

export type VotingMintConfig = IdlTypes<HeliumVoterStakeRegistry>['VotingMintConfigV0']
type RegistrarV0 = IdlAccounts<HeliumVoterStakeRegistry>['registrar']
export type Lockup = IdlTypes<HeliumVoterStakeRegistry>['Lockup']
export type PositionV0 = IdlAccounts<HeliumVoterStakeRegistry>['positionV0']
export type DelegatedPostionV0 = IdlAccounts<HeliumSubDaos>['delegatedPositionV0']
export interface Registrar extends RegistrarV0 {
  votingMints: VotingMintConfig[]
}
export interface Position extends Omit<PositionV0, 'lockup'> {
  lockup: Lockup
}
export interface PositionWithMeta extends Position {
  pubkey: PublicKey
  isDelegated: boolean
  delegatedSubDao: PublicKey | null
  hasRewards: boolean
  hasGenesisMultiplier: boolean
  votingPower: BN
  votingMint: VotingMintConfig & {
    mint: TokenProgramAccount<MintInfo>
  }
}
export type LockupKind = IdlTypes<HeliumVoterStakeRegistry>['LockupKind']
export type InitializePositionV0Args = IdlTypes<HeliumVoterStakeRegistry>['InitializePositionArgsV0']

export type SubDao = IdlAccounts<HeliumSubDaos>['subDaoV0']
export interface SubDaoWithMeta extends Omit<SubDao, 'dntMint'> {
  pubkey: PublicKey
  dntMetadata: Sft
}
