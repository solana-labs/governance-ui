import { TransactionInstruction } from '@solana/web3.js'
import { QueryClient } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10 * 60 * 1000 } },
})
export default queryClient

export const invalidateInstructionAccounts = async (
  ix: TransactionInstruction
) =>
  Promise.all(
    ix.keys
      .filter((x) => x.isWritable)
      .map((x) => x.pubkey)
      .map((x) => queryClient.invalidateQueries([x]))
  )
