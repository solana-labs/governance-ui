import TreasuryAccountsItems from './TreasuryAccountsItems'

const TreasuryAccountsCompactWrapper = () => {
  return (
    <div className="bg-bkg-2 p-4 md:p-6 rounded-lg mt-5">
      <h3 className="mb-4">Treasury Accounts</h3>
      <div className="max-h-full overflow-y-auto">
        <TreasuryAccountsItems></TreasuryAccountsItems>
      </div>
    </div>
  )
}

export default TreasuryAccountsCompactWrapper
