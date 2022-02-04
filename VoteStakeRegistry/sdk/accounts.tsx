import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { TokenProgramAccount } from '@utils/tokens'

export interface Voter {
  deposits: Deposit[]
  voterAuthority: PublicKey
  registrar: PublicKey
  //there are more fields but no use for them on ui yet
}

export interface votingMint {
  unlockedScaledFactor: BN
  digitShift: number
  grantAuthority: PublicKey
  lockupSaturationSecs: BN
  lockupScaledFactor: BN
  mint: PublicKey
}

export type LockupType = 'none' | 'monthly' | 'cliff' | 'constant' | 'daily' //there is also daily type but not used on ui yet
export interface Registrar {
  governanceProgramId: PublicKey
  realm: PublicKey
  realmAuthority: PublicKey
  realmGoverningTokenMint: PublicKey
  votingMints: votingMint[]
  //there are more fields but no use for them on ui yet
}
interface LockupKind {
  none: object
  daily: object
  monthly: object
  cliff: object
  constant: object
}
interface Lockup {
  endTs: BN
  kind: LockupKind
  startTs: BN
}
export interface Deposit {
  allowClawback: boolean
  amountDepositedNative: BN
  amountInitiallyLockedNative: BN
  isUsed: boolean
  lockup: Lockup
  votingMintConfigIdx: number
}
export interface DepositWithMintAccount extends Deposit {
  mint: TokenProgramAccount<MintInfo>
  index: number
  available: BN
  vestingRate: BN | null
  currentlyLocked: BN
}

export const unusedMintPk = '11111111111111111111111111111111'

export const getRegistrarPDA = async (
  realmPk: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey
) => {
  const [registrar, registrarBump] = await PublicKey.findProgramAddress(
    [realmPk.toBuffer(), Buffer.from('registrar'), mint.toBuffer()],
    clientProgramId
  )
  return {
    registrar,
    registrarBump,
  }
}

export const getVoterPDA = async (
  registrar: PublicKey,
  walletPk: PublicKey,
  clientProgramId: PublicKey
) => {
  const [voter, voterBump] = await PublicKey.findProgramAddress(
    [registrar.toBuffer(), Buffer.from('voter'), walletPk.toBuffer()],
    clientProgramId
  )

  return {
    voter,
    voterBump,
  }
}

export const getVoterWeightPDA = async (
  registrar: PublicKey,
  walletPk: PublicKey,
  clientProgramId: PublicKey
) => {
  const [voterWeightPk, voterWeightBump] = await PublicKey.findProgramAddress(
    [
      registrar.toBuffer(),
      Buffer.from('voter-weight-record'),
      walletPk.toBuffer(),
    ],
    clientProgramId
  )

  return {
    voterWeightPk,
    voterWeightBump,
  }
}
