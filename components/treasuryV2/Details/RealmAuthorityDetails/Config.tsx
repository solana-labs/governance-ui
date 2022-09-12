import React, { useState } from 'react'
import cx from 'classnames'
import { PencilIcon } from '@heroicons/react/outline'
import { BigNumber } from 'bignumber.js'

import RealmConfigModal from 'pages/dao/[symbol]/params/RealmConfigModal'
import { RealmAuthority } from '@models/treasury/Asset'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Tooltip from '@components/Tooltip'
import { formatNumber } from '@utils/formatNumber'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import useRealm from '@hooks/useRealm'

const DISABLED = new BigNumber(DISABLED_VOTER_WEIGHT.toString())

interface Props {
  className?: string
  realmAuthority: RealmAuthority
}

export default function Config(props: Props) {
  const { canUseAuthorityInstruction } = useGovernanceAssets()
  const { mint } = useRealm()
  const [editRealmOpen, setEditRealmOpen] = useState(false)

  const config = [
    ...(props.realmAuthority.config.communityMintMaxVoteWeightSource
      ? [
          {
            title: 'Community mint max vote weight source',
            value: props.realmAuthority.config.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage(),
          },
        ]
      : []),
    {
      title: 'Min community tokens to create governance',
      value: DISABLED.shiftedBy(
        -(mint ? mint.decimals : 0)
      ).isLessThanOrEqualTo(
        props.realmAuthority.config.minCommunityTokensToCreateGovernance
      )
        ? 'Disabled'
        : formatNumber(
            props.realmAuthority.config.minCommunityTokensToCreateGovernance,
            undefined,
            { maximumFractionDigits: 2 }
          ),
    },
    {
      title: 'Use community voter weight add-in',
      value: props.realmAuthority.config.useCommunityVoterWeightAddin
        ? 'Yes'
        : 'No',
    },
    {
      title: 'Use max community voter weight add-in',
      value: props.realmAuthority.config.useMaxCommunityVoterWeightAddin
        ? 'Yes'
        : 'No',
    },
  ]

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between">
        <div className="text-xl text-fgd-1 font-bold">Configuration</div>
        <Tooltip
          content={
            !canUseAuthorityInstruction
              ? 'Please connect a wallet with enough voting power to create realm config proposals'
              : ''
          }
        >
          <button
            className={cx(
              'cursor-pointer',
              'flex',
              'items-center',
              'space-x-1',
              'text-primary-light',
              'text-sm',
              'disabled:cursor-not-allowed',
              'disabled:opacity-50'
            )}
            disabled={!canUseAuthorityInstruction}
            onClick={() => setEditRealmOpen(true)}
          >
            <PencilIcon className="h-4 w-4" />
            <div>Change config</div>
          </button>
        </Tooltip>
      </div>
      <div className="grid grid-cols-2 gap-8 mt-12">
        {config.map(({ title, value }) => (
          <div key={title}>
            <div className="text-xs text-white/50">{title}</div>
            <div className="mt-1 text-sm text-fgd-1">{value}</div>
          </div>
        ))}
      </div>
      {editRealmOpen && (
        <RealmConfigModal
          isProposalModalOpen
          closeProposalModal={() => setEditRealmOpen(false)}
        />
      )}
    </div>
  )
}
