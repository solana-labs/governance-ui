import Button, { LinkButton } from '@components/Button'
import Input from '@components/inputs/Input'
import { getAccountName } from '@components/instructions/tools'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { tryParseKey } from '@tools/validators/pubkey'
import { debounce } from '@utils/debounce'
import { precision } from '@utils/formatting'
import { ProgramAccount, tryGetTokenAccount } from '@utils/tokens'
import { SplTokenTransferForm } from '@utils/uiTypes/proposalCreationTypes'
import React, { useEffect, useState } from 'react'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import useWalletStore from 'stores/useWalletStore'
import { ViewState } from './Types'

const SendTokens = () => {
  const {
    setCurrentCompactView,
    resetCompactViewState,
  } = useTreasuryAccountStore()
  const currentAccount = useTreasuryAccountStore(
    (s) => s.compact.currentAccount
  )
  const connection = useWalletStore((s) => s.connection)
  const { realmInfo } = useRealm()
  const tokenInfo = useTreasuryAccountStore((s) => s.compact.tokenInfo)

  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    // No default transfer amount
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })
  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)
  const [formErrors, setFormErrors] = useState({})
  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)
  const mintMinAmount = form.governedTokenAccount?.mint
    ? getMintMinAmountAsDecimal(form.governedTokenAccount.mint.account)
    : 1

  function handleGoBackToMainView() {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }
  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }
  const currentPrecision = precision(mintMinAmount)
  useEffect(() => {
    if (currentAccount) {
      handleSetForm({
        value: currentAccount,
        propertyName: 'governedTokenAccount',
      })
    }
  }, [currentAccount])
  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])

  return (
    <>
      <h3 className="mb-4">Send {tokenInfo?.symbol}</h3>
      {tokenInfo?.logoURI && (
        <div className="flex justify-center mb-4">
          <img className="flex-shrink-0 h-14 w-14" src={tokenInfo.logoURI} />
        </div>
      )}
      <div>
        <Input
          label="Destination account"
          value={form.destinationAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'destinationAccount',
            })
          }
          error={formErrors['destinationAccount']}
        />
        {destinationAccount && (
          <div>
            <div className="pb-0.5 text-fgd-3 text-xs">Account owner</div>
            <div className="text-xs">
              {destinationAccount.account.owner.toString()}
            </div>
          </div>
        )}
        {destinationAccountName && (
          <div>
            <div className="pb-0.5 text-fgd-3 text-xs">Account name</div>
            <div className="text-xs">{destinationAccountName}</div>
          </div>
        )}
        <Input
          min={mintMinAmount}
          label="Amount"
          value={form.amount}
          type="number"
          onChange={setAmount}
          step={mintMinAmount}
          error={formErrors['amount']}
          onBlur={validateAmountOnBlur}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <LinkButton
          className="sm:w-1/2 text-th-fgd-1"
          onClick={handleGoBackToMainView}
        >
          Cancel
        </LinkButton>
        {/* TODO block send here or you can't even go here without connection ? */}
        <Button className="sm:w-1/2">Send</Button>
      </div>
    </>
  )
}

export default SendTokens
