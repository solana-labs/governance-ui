import create, { State } from 'zustand'

interface TransactionStore extends State {
  isProcessing: boolean
  transactionsCount: number
  processedTransactions: number
  hasErrors: boolean
  error: any
  txid: string
  retryCallback: (() => Promise<void>) | null
  startProcessing: (transactionsCount: number) => void
  incrementProcessedTransactions: () => void
  closeTransactionProcess: () => void
  showTransactionError: (
    retryCallback: () => Promise<void>,
    e: any,
    txid: string
  ) => void
}

const defaultState = {
  isProcessing: false,
  transactionsCount: 0,
  processedTransactions: 0,
  retryCallback: null,
  hasErrors: false,
  error: '',
  txid: '',
}

const useTransactionsStore = create<TransactionStore>((set, _get) => ({
  ...defaultState,
  startProcessing: (transactionsCount) =>
    set({
      ...defaultState,
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
      ...defaultState,
    })
  },
  showTransactionError: (retryCallback, error, txid) => {
    set({
      retryCallback: retryCallback,
      error,
      hasErrors: true,
      txid: txid,
    })
  },
}))

export default useTransactionsStore
