import { GatewayClient } from '@solana/governance-program-library'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { tryGetGatewayRegistrar } from 'GatewayPlugin/sdk/api'

export function useTryGetGatewayRegistrarQuery(
  registrarPk: PublicKey,
  client: GatewayClient
) {
  // TODO - enabled, staleTime, cacheTime as a config?
  return useQuery({
    queryKey: [registrarPk, client.governanceProgramId],
    queryFn: async () => tryGetGatewayRegistrar(registrarPk, client),
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
  })
}
