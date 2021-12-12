import AccountsCompactWrapper from '@components/TreasuryAccount/AccountsCompactWrapper'
import NewAccountForm from '@components/TreasuryAccount/NewAccountForm'
import React from 'react'

const New = () => {
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12 md:col-span-7 lg:col-span-8 space-y-3">
        <NewAccountForm></NewAccountForm>
      </div>
      <div className="col-span-12 md:col-span-5 lg:col-span-4 space-y-4">
        <AccountsCompactWrapper />
      </div>
    </div>
  )
}

export default New
