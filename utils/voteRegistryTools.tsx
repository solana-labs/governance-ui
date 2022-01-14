import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'

interface LockupKindNone {
  none: object
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
  realmPubKey: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey
) => {
  const [registrar, registrarBump] = await PublicKey.findProgramAddress(
    [realmPubKey.toBuffer(), Buffer.from('registrar'), mint.toBuffer()],
    clientProgramId
  )
  return {
    registrar,
    registrarBump,
  }
}

export const getVoterPDA = async (
  registrar: PublicKey,
  walletPubKey: PublicKey,
  clientProgramId: PublicKey
) => {
  const [voter, voterBump] = await PublicKey.findProgramAddress(
    [registrar.toBuffer(), Buffer.from('voter'), walletPubKey.toBuffer()],
    clientProgramId
  )

  return {
    voter,
    voterBump,
  }
}

export const getVoterWeightPDA = async (
  registrar: PublicKey,
  walletPubKey: PublicKey,
  clientProgramId: PublicKey
) => {
  const [voterWeight, voterWeightBump] = await PublicKey.findProgramAddress(
    [
      registrar.toBuffer(),
      Buffer.from('voter-weight-record'),
      walletPubKey.toBuffer(),
    ],
    clientProgramId
  )

  return {
    voterWeight,
    voterWeightBump,
  }
}

export const tryGetVoter = async (
  voterPubKey: PublicKey,
  client: VsrClient
) => {
  try {
    const voter = await client?.program.account.voter.fetch(voterPubKey)
    return voter
  } catch (e) {
    return null
  }
}

export const getUsedDeposit = async (
  realmPubKey: PublicKey,
  mint: PublicKey,
  walletPubKey: PublicKey,
  client: VsrClient,
  kind: 'none'
) => {
  const clientProgramId = client.program.programId
  const { registrar } = await getRegistrarPDA(
    realmPubKey,
    mint,
    clientProgramId
  )
  const { voter } = await getVoterPDA(registrar, walletPubKey, clientProgramId)
  const existingVoter = await tryGetVoter(voter, client)

  const deposit = (existingVoter?.deposits as Deposit[]).find(
    (x) => x.isUsed && typeof x.lockup.kind[kind] !== 'undefined'
  )
  console.log(deposit)
  return deposit
}
