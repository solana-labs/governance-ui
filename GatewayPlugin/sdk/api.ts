import { PublicKey } from '@solana/web3.js'
import { GatewayClient } from '@solana/governance-program-library'

export const tryGetGatewayRegistrar = async (
  registrarPk: PublicKey,
  client: GatewayClient
) => {
  try {
    const existingRegistrar = await client.program.account.registrar.fetch(
      registrarPk
    )
    return existingRegistrar
  } catch (e) {
    return null
  }
}
