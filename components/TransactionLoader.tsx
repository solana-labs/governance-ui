import useTransactionsStore from 'stores/useTransactionStore'
import Modal from './Modal'

const TransactionLoader = () => {
  const {
    isProcessing,
    transactionsCount,
    processedTransactions,
  } = useTransactionsStore()

  return isProcessing ? (
    <Modal
      onClose={() => {
        return null
      }}
      isOpen={isProcessing}
    >
      <h2>Processing {transactionsCount} transactions</h2>
      <div>
        Transactions left to process {transactionsCount - processedTransactions}
      </div>
      <div className="pb-5 pt-2">
        <div className="w-full h-4 bg-gray-200 rounded-full dark:bg-gray-700">
          <div
            className="h-4 bg-gray-600 rounded-full dark:bg-gray-300 animate-pulse"
            style={{
              width: `${(processedTransactions * 100) / transactionsCount}%`,
            }}
          ></div>
        </div>
      </div>
    </Modal>
  ) : null
}

export default TransactionLoader
