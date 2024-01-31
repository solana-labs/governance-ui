import { QuadraticClient } from '@solana/governance-program-library'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { tryGetQuadraticRegistrar } from 'QuadraticPlugin/sdk/api'

export function useTryGetQuadraticRegistrarQuery(
  registrarPk: PublicKey,
  quadraticClient: QuadraticClient
) {
  // TODO - enabled, staleTime, cacheTime as a config?
  return useQuery({
    queryKey: [registrarPk, quadraticClient.governanceProgramId],
    queryFn: async () => tryGetQuadraticRegistrar(registrarPk, quadraticClient),
    staleTime: 3600000, // 1 hour
    cacheTime: 3600000 * 24 * 10,
  })
}
