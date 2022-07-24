import { PublicKey } from '@solana/web3.js'

export const getRegistrarPDA = async (
  realmPk: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey
) => {
  const [registrar, registrarBump] = await PublicKey.findProgramAddress(
    [Buffer.from('registrar'), realmPk.toBuffer(), mint.toBuffer()],
    clientProgramId
  )
  return {
    registrar,
    registrarBump,
  }
}

export const getMaxVoterWeightRecord = async (
  realmPk: PublicKey,
  mint: PublicKey,
  clientProgramId: PublicKey
) => {
  const [
    maxVoterWeightRecord,
    maxVoterWeightRecordBump,
  ] = await PublicKey.findProgramAddress(
    [
      Buffer.from('max-voter-weight-record'),
      realmPk.toBuffer(),
      mint.toBuffer(),
    ],
    clientProgramId
  )
  return {
    maxVoterWeightRecord,
    maxVoterWeightRecordBump,
  }
}

export const getVoterWeightRecord = async (
  realmPk: PublicKey,
  mint: PublicKey,
  walletPk: PublicKey,
  clientProgramId: PublicKey
) => {
  const [
    voterWeightPk,
    voterWeightRecordBump,
  ] = await PublicKey.findProgramAddress(
    [
      Buffer.from('voter-weight-record'),
      realmPk.toBuffer(),
      mint.toBuffer(),
      walletPk.toBuffer(),
    ],
    clientProgramId
  )

  return {
    voterWeightPk,
    voterWeightRecordBump,
  }
}
