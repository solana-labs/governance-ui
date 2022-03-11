import { fmtBnMintDecimals } from '@tools/sdk/units'
import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import LoadingRows from './LoadingRows'

const TokenAccounts = () => {
  const tokenAccounts = useTreasuryAccountStore((s) => s.allTokenAccounts)
  const isLoadingTokenAccounts = useTreasuryAccountStore(
    (s) => s.isLoadingTokenAccounts
  )
  return (
    <div>
      {isLoadingTokenAccounts ? (
        <LoadingRows />
      ) : tokenAccounts.length > 0 ? (
        tokenAccounts.map((tokenAccount, index) => (
          <div
            key={index.toString()}
            className="border border-fgd-4 default-transition flex items-center justify-between rounded-md p-4 text-sm text-th-fgd-1 mb-2"
          >
            <div>
              {fmtBnMintDecimals(
                tokenAccount.amount,
                tokenAccount.mintInfo.decimals
              )}{' '}
              {tokenAccount.tokenInfo?.symbol
                ? tokenAccount.tokenInfo?.symbol
                : `${tokenAccount.mint.toString().substring(0, 12)}...`}
            </div>
          </div>
        ))
      ) : (
        <div className="border border-fgd-4 p-4 rounded-md">
          <p className="text-center text-fgd-3">No Token Accounts Found</p>
        </div>
      )}
    </div>
  )
}

export default TokenAccounts
