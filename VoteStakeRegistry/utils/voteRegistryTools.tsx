import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { Connection, PublicKey } from '@solana/web3.js'
import { TokenProgramAccount, tryGetMint } from '@utils/tokens'

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

export type LockupKinds = 'none' | 'daily' | 'monthly' | 'cliff' | 'constant'
interface Registrar {
  governanceProgramId: PublicKey
  realm: PublicKey
  realmAuthority: PublicKey
  realmGoverningTokenMint: PublicKey
  votingMints: votingMint[]
  //there are more fields but no use for them on ui yet
}
export interface LockupKind {
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

export interface DepositWithIdx extends Deposit {
  index: number
}

export const unusedMintPk = '11111111111111111111111111111111'

export interface DepositWithMintPk extends Deposit {
  mint: TokenProgramAccount<MintInfo>
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
  kind: LockupKinds
) => {
  const clientProgramId = client.program.programId
  const { registrar } = await getRegistrarPDA(realmPk, mint, clientProgramId)
  const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
  const existingVoter = await tryGetVoter(voter, client)
  const mintCfgIdx = await getMintCfgIdx(registrar, mint, client)
  console.log(existingVoter?.deposits)
  const findFcn = (x) =>
    x.isUsed &&
    typeof x.lockup.kind[kind] !== 'undefined' &&
    x.votingMintConfigIdx === mintCfgIdx
  const index = existingVoter?.deposits.findIndex(findFcn)
  const deposit = existingVoter?.deposits.find(findFcn)
  return { ...deposit, index } as DepositWithIdx
}

export const getUsedDeposits = async (
  realmPk: PublicKey,
  walletPk: PublicKey,
  communityMintPk: PublicKey,
  client: VsrClient,
  connection: Connection
) => {
  const clientProgramId = client.program.programId
  const { registrar } = await getRegistrarPDA(
    realmPk,
    communityMintPk,
    clientProgramId
  )
  const { voter } = await getVoterPDA(registrar, walletPk, clientProgramId)
  const existingVoter = await tryGetVoter(voter, client)
  const existingRegistrar = await tryGetRegistrar(registrar, client)
  const mintCfgs = existingRegistrar?.votingMints
  const mints = {}
  if (mintCfgs) {
    for (const i of mintCfgs) {
      if (i.mint.toBase58() !== unusedMintPk) {
        const mint = await tryGetMint(connection, i.mint)
        mints[i.mint.toBase58()] = mint
      }
    }
  }
  const deposits = existingVoter?.deposits
    .filter((x) => x.isUsed)
    .map(
      (x) =>
        ({
          ...x,
          mint: mints[mintCfgs![x.votingMintConfigIdx].mint.toBase58()],
        } as DepositWithMintPk)
    )
  return deposits
}
