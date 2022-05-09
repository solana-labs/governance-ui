import create, { State } from 'zustand'

interface TransactionStore extends State {
  isProcessing: boolean
  transactionsCount: number
  processedTransactions: number
  startProcessing: (transactionsCount: number) => void
  incrementProcessedTransactions: () => void
  closeTransactionProcess: () => void
}

const useTransactionsStore = create<TransactionStore>((set, _get) => ({
  isProcessing: false,
  transactionsCount: 0,
  processedTransactions: 0,
  startProcessing: (transactionsCount) =>
    set({
      transactionsCount: transactionsCount,
      isProcessing: true,
    }),
  incrementProcessedTransactions: () => {
    const currentCount = _get().processedTransactions
    set({
      processedTransactions: currentCount + 1,
    })
  },
  closeTransactionProcess: () => {
    set({
      isProcessing: false,
      transactionsCount: 0,
      processedTransactions: 0,
    })
  },
}))

export default useTransactionsStore
