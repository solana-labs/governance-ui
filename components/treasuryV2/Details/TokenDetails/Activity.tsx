import React from 'react'
import cx from 'classnames'
import { ExternalLinkIcon } from '@heroicons/react/outline'

import useAccountActivity from '@hooks/useAccountActivity'
import { Sol, Token } from '@models/treasury/Asset'
import { Status } from '@utils/uiTypes/Result'
import { fmtUnixTime } from '@utils/formatting'
import { getExplorerUrl } from '@components/explorer/tools'
import useWalletStore from 'stores/useWalletStore'

interface Props {
  className?: string
  assets: Pick<Sol | Token, 'address'>[]
  title?: string
}

export default function Activity(props: Props) {
  const activity = useAccountActivity(props.assets.map((a) => a.address))
  const cluster = useWalletStore((s) => s.connection.cluster)

  switch (activity.status) {
    case Status.Failed:
      return (
        <div className={props.className}>
          <header className="mb-3">
            <div className="bg-bkg-1 rounded-sm text-lg opacity-50 w-32">
              &nbsp;
            </div>
          </header>
          <section className="overflow-y-auto flex-grow space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="h-14 rounded bg-bkg-1 opacity-50" key={i} />
            ))}
          </section>
        </div>
      )
    case Status.Pending:
      return (
        <div className={props.className}>
          <header className="mb-3">
            <div className="bg-bkg-1 rounded-sm text-lg animate-pulse w-32">
              &nbsp;
            </div>
          </header>
          <section className="overflow-y-auto flex-grow space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div className="h-14 rounded bg-bkg-1 animate-pulse" key={i} />
            ))}
          </section>
        </div>
      )
    default:
      return (
        <div className={props.className}>
          <header className="mb-3">
            <div className="text-fgd-1 text-lg font-bold">
              {props.title || 'Recent Activity'}
            </div>
          </header>
          <section className="overflow-y-auto flex-grow space-y-4">
            {!activity.data.length && (
              <div
                className={cx(
                  'bg-bkg-2',
                  'flex',
                  'items-center',
                  'justify-center',
                  'px-8',
                  'py-4',
                  'rounded',
                  'text-sm',
                  'text-white/50'
                )}
              >
                No activity
              </div>
            )}
            {activity.data.map((item) => (
              <a
                className={cx(
                  'border-white/30',
                  'border',
                  'flex',
                  'h-14',
                  'items-center',
                  'justify-between',
                  'px-4',
                  'rounded-md'
                )}
                key={item.signature}
                href={
                  item.signature
                    ? getExplorerUrl(cluster, item.signature, 'tx')
                    : undefined
                }
                target="_blank"
                rel="noreferrer"
              >
                <div
                  className={cx(
                    'max-w-[30%]',
                    'overflow-hidden',
                    'text-ellipsis',
                    'text-fgd-1',
                    'text-sm',
                    'whitespace-nowrap'
                  )}
                >
                  {item.signature}
                </div>
                <div className="flex items-center">
                  {!!item.blockTime && (
                    <div className="text-fgd-1 text-sm">
                      {fmtUnixTime(item.blockTime)}
                    </div>
                  )}
                  {item.signature ? (
                    <ExternalLinkIcon className="w-4 h-4 ml-2 text-primary-light" />
                  ) : (
                    <div className="w-4 h-4 ml-2" />
                  )}
                </div>
              </a>
            ))}
          </section>
        </div>
      )
  }
}
