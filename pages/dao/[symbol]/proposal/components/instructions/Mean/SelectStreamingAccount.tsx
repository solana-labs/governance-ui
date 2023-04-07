import { PaymentStreamingAccount } from '@mean-dao/payment-streaming'
import { BN } from '@coral-xyz/anchor'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import createPaymentStreaming from '@utils/instructions/Mean/createPaymentStreaming'
import getMint from '@utils/instructions/Mean/getMint'
import { AssetAccount } from '@utils/uiTypes/assets'

const getLabel = (
  paymentStreamingAccount: PaymentStreamingAccount | undefined,
  accounts: AssetAccount[]
) => {
  if (!paymentStreamingAccount) return undefined
  const passedAccount = getMint(accounts, paymentStreamingAccount)
  const amount = passedAccount
    ? formatMintNaturalAmountAsDecimal(
        passedAccount,
        new BN(paymentStreamingAccount.balance)
      )
    : paymentStreamingAccount.balance

  return (
    <div className="break-all text-fgd-1 ">
      <div className="mb-0.5 text-primary-light">
        {paymentStreamingAccount.name}
      </div>
      <div className="mb-2 text-fgd-3 text-xs">
        {paymentStreamingAccount.id.toBase58()}
      </div>
      <div className="flex space-x-3 text-xs text-fgd-3">
        <div className="flex items-center">
          Streams:
          <span className="ml-1 text-fgd-1">
            {paymentStreamingAccount.totalStreams}
          </span>
        </div>
        <div className="flex items-center">
          Token:
          <span className="ml-1 text-fgd-1">
            {abbreviateAddress(paymentStreamingAccount.mint)}
          </span>
        </div>
        <div>
          Bal:<span className="ml-1 text-fgd-1">{amount}</span>
        </div>
      </div>
    </div>
  )
}

interface Props {
  onChange: (paymentStreamingAccount: PaymentStreamingAccount) => void
  value: PaymentStreamingAccount | undefined
  label: string
  error?: string
  shouldBeGoverned?: boolean
  governance?: ProgramAccount<Governance> | null | undefined
}

const SelectStreamingAccount = ({
  onChange,
  value,
  label,
  error,
  shouldBeGoverned = false,
  governance,
}: Props) => {
  const connection = useWalletStore((s) => s.connection)

  const { governedTokenAccountsWithoutNfts: accounts } = useGovernanceAssets()
  const [paymentStreamingAccounts, setPaymentStreamingAccounts] = useState<
    PaymentStreamingAccount[]
  >([])
  useEffect(() => {
    ;(async () => {
      const paymentStreaming = createPaymentStreaming(connection)

      const nextPaymentStreamingAccounts = await Promise.all(
        accounts
          .filter((x) =>
            !shouldBeGoverned
              ? !shouldBeGoverned
              : x?.governance?.pubkey.toBase58() ===
                governance?.pubkey?.toBase58()
          )
          .filter((a) => a.isSol)
          .map((a) => paymentStreaming.listAccounts(a.governance.pubkey, true))
      )
      setPaymentStreamingAccounts(
        nextPaymentStreamingAccounts.flat().filter((t) => getMint(accounts, t))
      )
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(accounts)])

  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value, accounts)}
      placeholder="Please select..."
      value={value?.id.toString()}
      error={error}
    >
      {paymentStreamingAccounts.map((paymentStreamingAccount) => {
        return (
          <Select.Option
            className="border-red"
            key={paymentStreamingAccount.id.toString()}
            value={paymentStreamingAccount}
          >
            {getLabel(paymentStreamingAccount, accounts)}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default SelectStreamingAccount
