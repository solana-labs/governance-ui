import useTransactionsStore from 'stores/useTransactionStore'
import Loading from './Loading'
import Modal from './Modal'

const TransactionLoader = () => {
  const {
    isProcessing,
    transactionsCount,
    processedTransactions,
  } = useTransactionsStore()
  const currentlyProcessing = processedTransactions + 1
  return isProcessing ? (
    <Modal
      onClose={() => {
        return null
      }}
      isOpen={isProcessing}
    >
      <h2>
        Transactions left to process {transactionsCount - processedTransactions}
      </h2>
      <div className="flex items-center text-xs">
        Currently processing transaction {currentlyProcessing} out of{' '}
        {transactionsCount}
        <div className="ml-2">
          <Loading></Loading>
        </div>
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
