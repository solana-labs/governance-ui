import useTransactionsStore from 'stores/useTransactionStore'

export function showTransactionsProcessUi(transactionsCount: number) {
  const { startProcessing } = useTransactionsStore.getState()

  startProcessing(transactionsCount)
}

export function incrementProcessedTransactions() {
  const { incrementProcessedTransactions } = useTransactionsStore.getState()

  incrementProcessedTransactions()
}

export function closeTransactionProcessUi() {
  const { closeTransactionProcess } = useTransactionsStore.getState()
  closeTransactionProcess()
}

export function showTransactionError(
  retryCallback: () => Promise<void>,
  e: any,
  txid: string
) {
  const { showTransactionError } = useTransactionsStore.getState()
  showTransactionError(retryCallback, e, txid)
}
