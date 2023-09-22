import { getGovernanceProgramVersion } from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'

export const programVersionQueryKeys = {
  byProgramId: (endpoint: string, programId: PublicKey) => [
    endpoint,
    'programVersion',
    programId.toString(),
  ],
}

export function useProgramVersionByIdQuery(
  realmsProgramId: PublicKey | undefined
) {
  const { connection } = useConnection()
  const query = useQuery({
    queryKey:
      realmsProgramId &&
      programVersionQueryKeys.byProgramId(
        connection.rpcEndpoint,
        realmsProgramId
      ),
    queryFn: () => getGovernanceProgramVersion(connection, realmsProgramId!),
    enabled: realmsProgramId !== undefined,
    // Staletime is zero by default, so queries get refetched often. Since program version is immutable it should never go stale.
    staleTime: Number.MAX_SAFE_INTEGER,
  })

  return query
}
