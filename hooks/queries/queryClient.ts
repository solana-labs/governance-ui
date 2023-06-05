import { TransactionInstruction } from '@solana/web3.js'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 10 * 60 * 1000, cacheTime: 30 * 60 * 1000 },
  },
})
export default queryClient

export const invalidateInstructionAccounts = async (
  ix: TransactionInstruction
) =>
  Promise.all(
    ix.keys
      .filter((x) => x.isWritable)
      .map((x) => x.pubkey)
      .map(async (x) => {
        // await new Promise((r) => setTimeout(r, 1000))
        console.log(
          'automatically invalidating due to mutating transaction:',
          x.toString()
        )
        await queryClient.invalidateQueries({
          predicate: (q) => q.queryKey?.includes(x.toString()),
        })
      })
  )
