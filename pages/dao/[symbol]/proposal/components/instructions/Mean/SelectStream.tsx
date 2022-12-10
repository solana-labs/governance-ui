import { Stream } from '@mean-dao/msp'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import React, { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import Select from '@components/inputs/Select'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import createMsp from '@utils/instructions/Mean/createMsp'

const getLabel = (stream: Stream | undefined) => {
  if (!stream) return undefined
  return (
    <div className="break-all text-fgd-1 ">
      <div className="mb-0.5 text-primary-light">{stream.name}</div>
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
              beneficiary: a.extensions.transferAddress,
            })
          )
      )
      setStreams(nextStreams.flat())
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(accounts)])

  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value)}
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
            {getLabel(stream)}
          </Select.Option>
        )
      })}
    </Select>
  )
}

export default SelectStream
