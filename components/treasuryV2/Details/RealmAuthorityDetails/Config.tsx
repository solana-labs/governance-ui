import React, { useState } from 'react'
import cx from 'classnames'
import {
  PencilIcon,
  ScaleIcon,
  DocumentAddIcon,
  BeakerIcon,
  CogIcon,
} from '@heroicons/react/outline'
import { BigNumber } from 'bignumber.js'

import RealmConfigModal from 'pages/dao/[symbol]/params/RealmConfigModal'
import { RealmAuthority } from '@models/treasury/Asset'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Tooltip from '@components/Tooltip'
import { formatNumber } from '@utils/formatNumber'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import useRealm from '@hooks/useRealm'
import Section from '../Section'

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
            icon: <ScaleIcon />,
          },
        ]
      : []),
    {
      icon: <DocumentAddIcon />,
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
      icon: <BeakerIcon />,
      title: 'Use community voter weight add-in',
      value: props.realmAuthority.config.useCommunityVoterWeightAddin
        ? 'Yes'
        : 'No',
    },
    {
      icon: <BeakerIcon />,
      title: 'Use max community voter weight add-in',
      value: props.realmAuthority.config.useMaxCommunityVoterWeightAddin
        ? 'Yes'
        : 'No',
    },
  ]

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between">
        <div className="text-xl text-fgd-1 font-bold flex items-center space-x-2">
          <CogIcon className="h-5 w-5" /> <span>Configuration</span>
        </div>
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
        {config.map(({ title, value, icon }) => (
          <Section key={title} value={value} name={title} icon={icon} />
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
