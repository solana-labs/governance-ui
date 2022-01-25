import { VsrClient } from '@blockworks-foundation/voter-stake-registry-client'
import { PublicKey } from '@solana/web3.js'
import { Registrar, Voter } from './accounts'

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
