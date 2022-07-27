import React from 'react'
import cx from 'classnames'
import { PlusCircleIcon, TerminalIcon } from '@heroicons/react/outline'
import { useRouter } from 'next/router'

import { formatNumber } from '@utils/formatNumber'
import { NEW_PROGRAM_VIEW } from 'pages/dao/[symbol]/assets'
import { Programs } from '@models/treasury/Asset'
import { SecondaryButton } from '@components/Button'
import Tooltip from '@components/Tooltip'
import useQueryContext from '@hooks/useQueryContext'
import useRealm from '@hooks/useRealm'
import useWalletStore from 'stores/useWalletStore'

interface Props {
  className?: string
  programs: Programs
}

export default function Header(props: Props) {
  const connected = useWalletStore((s) => s.connected)
  const { fmtUrlWithCluster } = useQueryContext()
  const { ownVoterWeight, realm, symbol } = useRealm()
  const router = useRouter()

  const tokenOwnerRecord = ownVoterWeight.canCreateGovernanceUsingCouncilTokens()
    ? ownVoterWeight.councilTokenRecord
    : realm && ownVoterWeight.canCreateGovernanceUsingCommunityTokens(realm)
    ? ownVoterWeight.communityTokenRecord
    : undefined

  return (
    <div
      className={cx(
        props.className,
        'bg-black',
        'min-h-[128px]',
        'px-8',
        'py-4',
        'flex',
        'items-center',
        'justify-between'
      )}
    >
      <div>
        <div className="flex items-center space-x-2">
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
      <Tooltip
        content={
          !connected
            ? 'You must connect your wallet'
            : !tokenOwnerRecord
            ? "You don't have the ability to add a new program"
            : ''
        }
      >
        <SecondaryButton
          className="w-48"
          disabled={!tokenOwnerRecord}
          onClick={() => {
            router.push(fmtUrlWithCluster(`/dao/${symbol}${NEW_PROGRAM_VIEW}`))
          }}
        >
          <div className="flex items-center justify-center">
            <PlusCircleIcon className="h-4 w-4 mr-1 scale-x-[-1]" />
            Add Program
          </div>
        </SecondaryButton>
      </Tooltip>
    </div>
  )
}
