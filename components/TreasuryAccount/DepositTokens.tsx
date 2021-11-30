import React from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import { ViewState } from './Types'
import { ArrowLeftIcon } from '@heroicons/react/solid'
import { LinkButton } from '@components/Button'
import { abbreviateAddress } from '@utils/formatting'
import { PublicKey } from '@solana/web3.js'
import { getAccountName } from '@components/instructions/tools'
import AccountLabel from './AccountHeader'

const SendTokens = () => {
  const { setCurrentCompactView } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)
  return (
    <>
      <h3 className="mb-4 flex items-center">
        <>
          <ArrowLeftIcon
            onClick={() => setCurrentCompactView(ViewState.AccountView)}
            className="h-4 w-4 mr-1 text-primary-light mr-2 hover:cursor-pointer"
          />
          Deposit {tokenInfo && tokenInfo?.symbol}
        </>
      </h3>
      <AccountLabel></AccountLabel>
      <div className="bg-bkg-1 px-4 py-2 rounded-md w-full break-all flex items-center">
        <div>
          <div className="text-fgd-3 text-xs">
            {currentAccount?.token?.publicKey &&
            getAccountName(currentAccount?.token?.publicKey) ? (
              <div className="text-sm text-th-fgd-1">
                {getAccountName(currentAccount.token?.publicKey)}
              </div>
            ) : (
              <div className="text-xs text-th-fgd-1">
                {abbreviateAddress(
                  currentAccount?.governance?.info.governedAccount as PublicKey
                )}
              </div>
            )}
          </div>
          {abbreviateAddress(
            currentAccount?.governance?.info.governedAccount as PublicKey
          )}
        </div>
        <div className="ml-auto">
          <LinkButton
            className="ml-4 text-th-fgd-1"
            onClick={() => {
              navigator.clipboard.writeText(
                currentAccount!.governance!.info.governedAccount.toBase58()
              )
            }}
          >
            Copy
          </LinkButton>
        </div>
      </div>
    </>
  )
}

export default SendTokens
