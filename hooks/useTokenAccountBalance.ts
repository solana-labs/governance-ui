import { getAssociatedTokenAddress } from '@blockworks-foundation/mango-v4'
import { useConnection } from '@solana/wallet-adapter-react'
import { Connection, PublicKey } from '@solana/web3.js'
import useSWR from 'swr'

const fetchTokenAccountBalance = async (
  connection: Connection,
  owner?: PublicKey | null,
  mint?: PublicKey
) => {
  if (!owner || !mint) throw new Error('No owner or mint provided')

  const ata = await getAssociatedTokenAddress(mint, owner, true)
  return (await connection.getTokenAccountBalance(ata, 'confirmed')).value
}

export default function useTokenAccountBalance(
  owner?: PublicKey | null,
  mint?: PublicKey
) {
  const { connection } = useConnection()

  const { data, mutate, error, isValidating } = useSWR(
    () =>
      owner &&
      mint && [
        owner.toBase58(),
        mint.toBase58(),
        connection.rpcEndpoint,
        'token_account',
      ],
    () => fetchTokenAccountBalance(connection, owner, mint),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
    }
  )
  const loading = !data && !error

  return {
    balance: data,
    loading,
    mutate,
    isValidating,
    error,
  }
}

// export function useTokenAccountBalance(
//   owner?: PublicKey | null,
//   mint?: PublicKey
// ) {
//   const connection = useWalletStore((s) => s.connection)

//   const [isLoading, setIsLoading] = useState(true)
//   const [balance, setBalance] = useState<TokenAmount | null>(null)

//   async function refetch() {
//     try {
//       if (!owner || !mint) {
//         return setBalance(null)
//       }
//       const ata = await getAssociatedTokenAddress(mint, owner, true)
//       const tokenBalance = await connection.current.getTokenAccountBalance(
//         ata,
//         'confirmed'
//       )
//       setBalance(tokenBalance.value)
//       console.log('FETCHED BALANCE', tokenBalance.value)
//     } catch (e) {
//       console.error("Can't fetch token balance")
//       setBalance(null)
//     }
//   }

//   // https://stackoverflow.com/questions/61751728/asynchronous-calls-with-react-usememo
//   useEffect(() => {
//     let active = true
//     fetchBalance()
//     return () => {
//       active = false
//     }

//     async function fetchBalance() {
//       console.log('[serum_gov]: fetching token balance')
//       try {
//         setIsLoading(true)
//         if (!owner || !mint) {
//           return setBalance(null)
//         }
//         const ata = await getAssociatedTokenAddress(mint, owner, true)
//         const tokenBalance = await connection.current.getTokenAccountBalance(
//           ata,
//           'confirmed'
//         )
//         if (!active) return
//         setBalance(tokenBalance.value)
//         console.log('[serum_gov]: fetched token balance', tokenBalance.value)
//       } catch (e) {
//         console.error("[serum_gov]: Can't fetch token balance")
//         setBalance(null)
//       } finally {
//         setIsLoading(false)
//       }
//     }
//   }, [owner, mint, connection.current.rpcEndpoint])

//   return { balance, isLoading, refetch }
// }
