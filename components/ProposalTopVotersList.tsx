import { FixedSizeList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import classNames from 'classnames'
import BN from 'bn.js'
import { BigNumber } from 'bignumber.js'
import { useEffect, useMemo, useRef, useState } from 'react'

import { formatPercentage } from '@utils/formatPercentage'
import { VoterDisplayData, VoteType } from '@models/proposal'
import { abbreviateAddress } from '@utils/formatting'
import { getExplorerUrl } from '@components/explorer/tools'

const ROW_STYLES =
  'absolute top-0 bottom-0 text-ellipsis overflow-hidden leading-[35px] px-2'

const COL_1_STYLES = classNames(ROW_STYLES, 'left-0', 'w-[25%]')

const COL_2_STYLES = classNames(
  ROW_STYLES,
  'left-[30%]',
  'w-[15%]',
  'text-right'
)

const COL_3_STYLES = classNames(
  ROW_STYLES,
  'left-[45%]',
  'w-[30%]',
  'text-right'
)

const COL_4_STYLES = classNames(
  ROW_STYLES,
  'left-[75%]',
  'right-0',
  'text-right'
)

const formatNumber = (value: BN, decimals: number) => {
  const num = new BigNumber(value.toString()).shiftedBy(-decimals)

  if (typeof Intl === 'undefined' || typeof navigator === 'undefined') {
    return num.toFormat()
  }

  const formatter = new Intl.NumberFormat(navigator.language, {
    minimumFractionDigits: decimals,
  })
  return formatter.format(num.toNumber())
}

const voteTypeText = (type: VoteType) => {
  switch (type) {
    case VoteType.No:
      return 'Nay'
    case VoteType.Undecided:
      return ''
    case VoteType.Yes:
      return 'Yay'
  }
}

const Filter = ({
  defaultChecked,
  label,
  onChange,
}: {
  defaultChecked?: boolean
  label: string
  onChange?(value: boolean): void
}) => {
  return (
    <label className="flex gap-1 items-center cursor-pointer">
      <input
        defaultChecked={defaultChecked}
        type="checkbox"
        onChange={(e) => {
          if (e.currentTarget.checked) {
            onChange?.(true)
          } else {
            onChange?.(false)
          }
        }}
      />
      <div className="text-xm text-fgd-3">{label}</div>
    </label>
  )
}

const voteTypeBg = (type: VoteType) => {
  switch (type) {
    case VoteType.No:
      return 'bg-rose-800'
    case VoteType.Undecided:
      return 'bg-neutral-600'
    case VoteType.Yes:
      return 'bg-lime-800'
  }
}

interface Props {
  className?: string
  data: VoterDisplayData[]
  endpoint: string
  highlighted?: string
  onHighlight?(key?: string): void
}

export default function ProposalTopVotersList(props: Props) {
  const ref = useRef<FixedSizeList<VoterDisplayData[]>>(null)
  const [showYays, setShowYays] = useState(true)
  const [showNays, setShowNays] = useState(true)
  const [showUndecideds, setShowUndecideds] = useState(true)

  const records = useMemo(
    () =>
      props.data.filter((data) => {
        if (data.voteType === VoteType.No && !showNays) {
          return false
        }

        if (data.voteType === VoteType.Undecided && !showUndecideds) {
          return false
        }

        if (data.voteType === VoteType.Yes && !showYays) {
          return false
        }

        return true
      }),
    [props.data, showYays, showNays, showUndecideds]
  )

  useEffect(() => {
    if (ref.current && props.highlighted) {
      const index = records.findIndex((data) => data.key === props.highlighted)

      if (index >= 0) {
        ref.current.scrollToItem(index, 'smart')
      }
    }
  }, [ref, props.highlighted, records])

  return (
    <div className={classNames(props.className, 'flex flex-col')}>
      <div className="relative h-[35px] border-b mb-2 border-fgd-4 flex-shrink-0">
        <div className={COL_1_STYLES}>Account</div>
        <div className={COL_2_STYLES}>Vote</div>
        <div className={COL_3_STYLES}>Vote Weight</div>
        <div className={COL_4_STYLES}>Percentage</div>
      </div>
      <div
        className="flex-grow"
        onMouseLeave={() => props.onHighlight?.(undefined)}
      >
        <AutoSizer>
          {({ height, width }) => (
            <FixedSizeList
              height={height}
              width={width}
              itemCount={records.length}
              itemData={records}
              itemSize={35}
              ref={ref}
            >
              {({ data, style, index }) => {
                const rowData = data[index]

                return (
                  <a
                    className="block"
                    style={style}
                    key={rowData.key}
                    href={getExplorerUrl(props.endpoint, rowData.name)}
                    target="_blank"
                    rel="noreferrer"
                    onMouseOver={() => props.onHighlight?.(rowData.key)}
                  >
                    <div
                      className={classNames(
                        'absolute',
                        'top-0',
                        'bottom-0',
                        'left-0',
                        'right-0',
                        '-z-10',
                        voteTypeBg(rowData.voteType),
                        rowData.key === props.highlighted
                          ? 'opacity-100'
                          : index % 2
                          ? 'opacity-40'
                          : 'opacity-20'
                      )}
                    />
                    <div
                      className={classNames(
                        COL_1_STYLES,
                        'opacity-80',
                        'text-sm'
                      )}
                    >
                      {abbreviateAddress(rowData.name)}
                    </div>
                    <div
                      className={classNames(
                        COL_2_STYLES,
                        'opacity-80',
                        'text-sm'
                      )}
                    >
                      {voteTypeText(rowData.voteType)}
                    </div>
                    <div
                      className={classNames(
                        COL_3_STYLES,
                        'opacity-80',
                        'text-sm'
                      )}
                    >
                      {formatNumber(rowData.votesCast, rowData.decimals)}
                    </div>
                    <div
                      className={classNames(
                        COL_4_STYLES,
                        'opacity-80',
                        'text-sm'
                      )}
                    >
                      {formatPercentage(rowData.votePercentage)}
                    </div>
                  </a>
                )
              }}
            </FixedSizeList>
          )}
        </AutoSizer>
      </div>
      <div className="flex-shink-0 text-xs px-2 mt-3 flex items-center gap-3">
        Show:
        <Filter defaultChecked={showYays} label="Yays" onChange={setShowYays} />
        <Filter defaultChecked={showNays} label="Nays" onChange={setShowNays} />
        <Filter
          defaultChecked={showUndecideds}
          label="Undecided"
          onChange={setShowUndecideds}
        />
      </div>
    </div>
  )
}
