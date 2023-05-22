import { getRealm } from '@solana/spl-governance'
import { useConnection } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import useSWR from 'swr'

const fetcher = async ({
  connection,
  realm,
}: {
  connection: Connection
  realm?: PublicKey
}) => {
  if (!realm) throw new Error('No realmId provided')

  console.log('[serum_gov]: fetching realm account info')
  return getRealm(connection, realm)
}

/** @deprecated use react-query */
const useRealmAccount = (realmId?: PublicKey) => {
  const { connection } = useConnection()

  const { data, mutate, isValidating, error } = useSWR(
    () => realmId && [realmId.toBase58(), connection.rpcEndpoint],
    () => fetcher({ connection, realm: realmId }),
    { revalidateOnFocus: false, revalidateIfStale: false, errorRetryCount: 0 }
  )

  const loading = !data && !error

  return {
    realmAccount: data,
    loading,
    mutate,
    isValidating,
    error,
  }
}

// const useRealmAccount = (realmId?: PublicKey) => {
//   const router = useRouter()
//   const { cluster } = router.query
//   //Small hack to prevent race conditions with cluster change until we remove connection from store and move it to global dep.
//   const routeHasClusterInPath = router.asPath.includes('cluster')

//   const connection = useWalletStore((s) => s.connection)
//   const [
//     realmAccount,
//     setRealmAccount,
//   ] = useState<ProgramAccount<Realm> | null>(null)

//   useEffect(() => {
//     async function fetchRealm() {
//       if (
//         connection &&
//         ((routeHasClusterInPath && cluster) || !routeHasClusterInPath) &&
//         realmId
//       ) {
//         const realm = await getRealm(connection.current, realmId)
//         setRealmAccount(realm)
//       } else setRealmAccount(null)
//     }
//     console.log('[serum_gov]: fetching realm account info')
//     fetchRealm()
//   }, [connection.current.rpcEndpoint, realmId?.toString()])

//   return realmAccount
// }

export default useRealmAccount
