import { Stream } from '@mean-dao/msp'
import { BN } from '@project-serum/anchor'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { formatMintNaturalAmountAsDecimal } from '@tools/sdk/units'
import createMsp from '@utils/instructions/Mean/createMsp'
import { abbreviateAddress } from '@utils/formatting'
import { AssetAccount } from '@utils/uiTypes/assets'
import getMint from './getMint'
import { PublicKey } from '@solana/web3.js'
/*
const getStreamTitle = (item: Stream | StreamInfo, trans?: any): string => {
  let title = ''
  if (item) {
    const v1 = item as StreamInfo
    const v2 = item as Stream

    if (item.version < 2) {
      if (v1.streamName) {
        return `${v1.streamName}`
      }

      if (v1.isUpdatePending) {
        title = `${
          trans
            ? trans('streams.stream-list.title-pending-from')
            : 'Pending execution from'
        } (${shortenAddress(`${v1.treasurerAddress}`)})`
      } else if (v1.state === STREAM_STATE.Schedule) {
        title = `${
          trans
            ? trans('streams.stream-list.title-scheduled-from')
            : 'Scheduled stream from'
        } (${shortenAddress(`${v1.treasurerAddress}`)})`
      } else if (v1.state === STREAM_STATE.Paused) {
        title = `${
          trans
            ? trans('streams.stream-list.title-paused-from')
            : 'Paused stream from'
        } (${shortenAddress(`${v1.treasurerAddress}`)})`
      } else {
        title = `${
          trans
            ? trans('streams.stream-list.title-receiving-from')
            : 'Receiving from'
        } (${shortenAddress(`${v1.treasurerAddress}`)})`
      }
    } else {
      if (v2.name) {
        return `${v2.name}`
      }

      if (v2.status === STREAM_STATUS.Scheduled) {
        title = `${
          trans
            ? trans('streams.stream-list.title-scheduled-from')
            : 'Scheduled stream from'
        } (${shortenAddress(`${v2.treasurer}`)})`
      } else if (v2.status === STREAM_STATUS.Paused) {
        title = `${
          trans
            ? trans('streams.stream-list.title-paused-from')
            : 'Paused stream from'
        } (${shortenAddress(`${v2.treasurer}`)})`
      } else {
        title = `${
          trans
            ? trans('streams.stream-list.title-receiving-from')
            : 'Receiving from'
        } (${shortenAddress(`${v2.treasurer}`)})`
      }
    }
  }

  return title
}
*/
/*
const getStreamSubtitle = useCallback(
  (item: Stream | StreamInfo) => {
    let subtitle = ''

    if (item) {
      const rate = +item.rateAmount.toString()
      let rateAmount =
        rate > 0 ? getRateAmountDisplay(item) : getDepositAmountDisplay(item)

      if (rate > 0) {
        rateAmount +=
          ' ' + getIntervalFromSeconds(item.rateIntervalInSeconds, true, t)
      }

      subtitle = rateAmount
    }

    return subtitle
  },
  [getDepositAmountDisplay, getRateAmountDisplay, t]
)
getStreamSubtitle(stream) || '0.00'
*/
const getLabel = (stream: Stream | undefined, accounts: AssetAccount[]) => {
  if (!stream) return undefined
  /*const passedAccount = getMint(accounts, treasury)
  const amount = passedAccount
    ? formatMintNaturalAmountAsDecimal(passedAccount, new BN(treasury.balance))
    : treasury.balance
*/
  return (
    <div className="break-all text-fgd-1 ">
      <div className="mb-0.5 text-primary-light">{stream.name}</div>
      {/* <div className="mb-2 text-fgd-3 text-xs">{treasury.id}</div>
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
      </div> */}
    </div>
  )
}

interface Props {
  onChange: (treasury: Stream) => void
  value: Stream | undefined
  label: string
  error?: string
  shouldBeGoverned?: boolean
  governance?: ProgramAccount<Governance> | null | undefined
}

const SelectStream = ({
  onChange,
  value,
  label,
  error,
  shouldBeGoverned = false,
  governance,
}: Props) => {
  const connection = useWalletStore((s) => s.connection)

  const { governedTokenAccountsWithoutNfts: accounts } = useGovernanceAssets()
  const [streams, setStreams] = useState<Stream[]>([])
  useEffect(() => {
    ;(async () => {
      const msp = createMsp(connection)

      const nextStreams = await Promise.all(
        accounts
          .filter((x) =>
            !shouldBeGoverned
              ? !shouldBeGoverned
              : x?.governance?.pubkey.toBase58() ===
                governance?.pubkey?.toBase58()
          )
          .filter((a) => a.isSol)
          .map((a) =>
            msp.listStreams({
              treasurer: a.governance.pubkey,
            })
          )
      )
      setStreams(nextStreams.flat())
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
      {streams.map((stream) => {
        return (
          <Select.Option
            className="border-red"
            key={stream.id.toString()}
            value={stream}
          >
            {getLabel(stream, accounts)}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default SelectStream
