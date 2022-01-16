import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'

interface Voter {
  deposits: Deposit[]
  voterAuthority: PublicKey
  registrar: PublicKey
  //there are more fields but no use for them on ui yet
}
interface votingMint {
  depositScaledFactor: BN
  digitShift: number
  grantAuthority: PublicKey
  lockupSaturationSecs: BN
  lockupScaledFactor: BN
  mint: PublicKey
}

interface Registrar {
  governanceProgramId: PublicKey
  realm: PublicKey
  realmAuthority: PublicKey
  realmGoverningTokenMint: PublicKey
  votingMints: votingMint[]
  //there are more fields but no use for them on ui yet
}
interface LockupKindNone {
  none: object
  daily: object
  monthly: object
  cliff: object
  constant: object
}
interface Lockup {
  endTs: BN
  kind: LockupKindNone
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
  const [voterWeight, voterWeightBump] = await PublicKey.findProgramAddress(
    [
      registrar.toBuffer(),
      Buffer.from('voter-weight-record'),
      walletPk.toBuffer(),
    ],
    clientProgramId
  )

  return {
    voterWeight,
    voterWeightBump,
  }
}

export const tryGetVoter = async (voterPk: PublicKey, client: VsrClient) => {
  try {
    const voter = await client?.program.account.voter.fetch(voterPk)
    return voter as Voter
  } catch (e) {
    return null
  }
}
export const tryGetRegistrar = async (
  registrarPk: PublicKey,
  client: VsrClient
) => {
  try {
    const existingRegistrar = await client.program.account.registrar.fetch(
      registrarPk
    )
    return existingRegistrar as Registrar
  } catch (e) {
    return null
  }
}

export const getMintCfgIdx = async (
  registrarPk: PublicKey,
  mintPK: PublicKey,
  client: VsrClient
) => {
  const existingRegistrar = await tryGetRegistrar(registrarPk, client)
  const mintCfgIdx = existingRegistrar?.votingMints.findIndex(
    (x) => x.mint.toBase58() === mintPK.toBase58()
  )
  if (mintCfgIdx === null || mintCfgIdx === -1) {
    throw 'mint not configured to use'
  }
  return mintCfgIdx
}

export const getUsedDeposit = async (
  realmPk: PublicKey,
  mint: PublicKey,
  walletPk: PublicKey,
  client: VsrClient,
  kind: 'none' | 'daily' | 'monthly' | 'cliff' | 'constant'
) => {
  const clientProgramId = client.program.programId
  const { registrar } = await getRegistrarPDA(realmPk, mint, clientProgramId)
  const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
  const existingVoter = await tryGetVoter(voter, client)
  const mintCfgIdx = await getMintCfgIdx(registrar, mint, client)
  const deposit = existingVoter?.deposits.find(
    (x) =>
      x.isUsed &&
      typeof x.lockup.kind[kind] !== 'undefined' &&
      x.votingMintConfigIdx === mintCfgIdx
  )
  return deposit
}
