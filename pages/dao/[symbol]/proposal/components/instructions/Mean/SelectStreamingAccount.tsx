import { Treasury } from '@mean-dao/msp'
import { BN } from '@project-serum/anchor'
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import createMsp from '@utils/instructions/Mean/createMsp'
import getMint from '@utils/instructions/Mean/getMint'
import { AssetAccount } from '@utils/uiTypes/assets'

const getLabel = (treasury: Treasury | undefined, accounts: AssetAccount[]) => {
  if (!treasury) return undefined
  const passedAccount = getMint(accounts, treasury)
  const amount = passedAccount
    ? formatMintNaturalAmountAsDecimal(passedAccount, new BN(treasury.balance))
    : treasury.balance

  return (
    <div className="break-all text-fgd-1 ">
      <div className="mb-0.5 text-primary-light">{treasury.name}</div>
      <div className="mb-2 text-fgd-3 text-xs">{treasury.id}</div>
      <div className="flex space-x-3 text-xs text-fgd-3">
        <div className="flex items-center">
          Streams:
          <span className="ml-1 text-fgd-1">{treasury.totalStreams}</span>
        </div>
        <div className="flex items-center">
          Token:
          <span className="ml-1 text-fgd-1">
            {abbreviateAddress(treasury.associatedToken)}
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
  onChange: (treasury: Treasury) => void
  value: Treasury | undefined
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
  const [treasuries, setTreasuries] = useState<Treasury[]>([])
  useEffect(() => {
    ;(async () => {
      const msp = createMsp(connection)

      const nextTreasuries = await Promise.all(
        accounts
          .filter((x) =>
            !shouldBeGoverned
              ? !shouldBeGoverned
              : x?.governance?.pubkey.toBase58() ===
                governance?.pubkey?.toBase58()
          )
          .filter((a) => a.isSol)
          .map((a) => msp.listTreasuries(a.governance.pubkey, true))
      )
      setTreasuries(nextTreasuries.flat().filter((t) => getMint(accounts, t)))
    })()
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
      {treasuries.map((treasury) => {
        return (
          <Select.Option
            className="border-red"
            key={treasury.id.toString()}
            value={treasury}
          >
            {getLabel(treasury, accounts)}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default SelectStreamingAccount
