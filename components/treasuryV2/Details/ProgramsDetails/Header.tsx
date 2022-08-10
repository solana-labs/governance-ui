import React from 'react'
import cx from 'classnames'
import { TerminalIcon } from '@heroicons/react/outline'

import { formatNumber } from '@utils/formatNumber'
import { Programs } from '@models/treasury/Asset'

interface Props {
  className?: string
  programs: Programs
}

export default function Header(props: Props) {
  return (
    <div
      className={cx(
        props.className,
        'bg-bkg-1',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-white/20">
            <TerminalIcon className="h-6 w-6 stroke-primary-light" />
          </div>
          <div>
            <div className="text-white/50 text-sm">Program Count</div>
            <div className="text-fgd-1 font-bold text-2xl">
              {formatNumber(props.programs.count, undefined, {})}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
