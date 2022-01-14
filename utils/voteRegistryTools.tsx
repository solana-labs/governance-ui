import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { PublicKey } from '@solana/web3.js'

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
