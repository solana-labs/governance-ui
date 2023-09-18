import cx from 'classnames'
import {
  PencilIcon,
  ScaleIcon,
  DocumentAddIcon,
  BeakerIcon,
  CogIcon,
  UserGroupIcon,
  OfficeBuildingIcon,
} from '@heroicons/react/outline'
import { BigNumber } from 'bignumber.js'
import { useRouter } from 'next/router'
import { MintMaxVoteWeightSourceType } from '@solana/spl-governance'

import { RealmAuthority } from '@models/treasury/Asset'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import Tooltip from '@components/Tooltip'
import { formatNumber } from '@utils/formatNumber'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import Section from '../Section'
import Address from '@components/Address'
import useProgramVersion from '@hooks/useProgramVersion'
import clsx from 'clsx'
import TokenIcon from '@components/treasuryV2/icons/TokenIcon'
import { NFTVotePluginSettingsDisplay } from '@components/NFTVotePluginSettingsDisplay'
import useQueryContext from '@hooks/useQueryContext'
import { DEFAULT_GOVERNANCE_PROGRAM_VERSION } from '@components/instructions/tools'
import { useRealmCommunityMintInfoQuery } from '@hooks/queries/mintInfo'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { NFT_PLUGINS_PKS } from '@constants/plugins'

const DISABLED = new BigNumber(DISABLED_VOTER_WEIGHT.toString())

interface Props {
  className?: string
  realmAuthority: RealmAuthority
}

export default function Config(props: Props) {
  const { canUseAuthorityInstruction } = useGovernanceAssets()
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const router = useRouter()
  const { symbol } = router.query
  const { fmtUrlWithCluster } = useQueryContext()

  const programVersion = useProgramVersion()
  const councilRulesSupported =
    (programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >= 3

  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const isNftMode =
    currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())

  return (
    <div className={props.className}>
      <div className="flex items-center justify-between">
        <div className="text-xl text-fgd-1 font-bold flex items-center space-x-2">
          <CogIcon className="h-5 w-5" /> <span>DAO Rules</span>
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
            onClick={() =>
              router.push(fmtUrlWithCluster(`/dao/${symbol}/editConfig`))
            }
          >
            <PencilIcon className="h-4 w-4" />
            <div>Edit Rules</div>
          </button>
        </Tooltip>
      </div>
      <div className={clsx('grid gap-8 mt-12 grid-cols-2')}>
        {props.realmAuthority.config.communityMintMaxVoteWeightSource && (
          <Section
            icon={<ScaleIcon />}
            name="Community mint max vote weight source"
            value={
              props.realmAuthority.config.communityMintMaxVoteWeightSource
                .type === MintMaxVoteWeightSourceType.Absolute
                ? formatNumber(
                    new BigNumber(
                      props.realmAuthority.config.communityMintMaxVoteWeightSource.value.toString()
                    ).shiftedBy(-(mint ? mint.decimals : 0))
                  )
                : `${props.realmAuthority.config.communityMintMaxVoteWeightSource.fmtSupplyFractionPercentage()}%`
            }
          />
        )}
        <Section
          name="Min community tokens to create governance"
          icon={<DocumentAddIcon />}
          value={
            DISABLED.shiftedBy(-(mint ? mint.decimals : 0)).isLessThanOrEqualTo(
              props.realmAuthority.config.minCommunityTokensToCreateGovernance
            )
              ? 'Disabled'
              : formatNumber(
                  props.realmAuthority.config
                    .minCommunityTokensToCreateGovernance,
                  undefined,
                  { maximumFractionDigits: 2 }
                )
          }
        />
      </div>
      <div
        className={clsx(
          'grid gap-8 mt-12',
          councilRulesSupported ? 'grid-cols-2' : 'grid-cols-1'
        )}
      >
        <div>
          {councilRulesSupported && (
            <div className="flex items-center space-x-2 text-fgd-1 mb-4">
              <UserGroupIcon className="h-5 w-5" />

              <div className="font-bold">Community Rules</div>
            </div>
          )}
          <div
            className={clsx(
              'grid gap-8',
              councilRulesSupported ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {(programVersion ?? DEFAULT_GOVERNANCE_PROGRAM_VERSION) >= 3 && (
              <Section
                icon={<TokenIcon />}
                name={'Token type'}
                value={
                  props.realmAuthority.config.communityTokenConfig
                    ? { 0: 'Liquid', 1: 'Membership', 2: 'Disabled' }[
                        props.realmAuthority.config.communityTokenConfig
                          .tokenType
                      ]
                    : 'Liquid'
                }
              />
            )}

            <Section
              icon={<BeakerIcon />}
              name={'Use community voter weight add‑in'}
              value={
                props.realmAuthority.config.communityTokenConfig
                  ?.voterWeightAddin ? (
                  <div className="flex gap-x-2">
                    Yes
                    <span className="text-white/50 flex-nowrap flex">
                      (
                      <Address
                        address={
                          props.realmAuthority.config.communityTokenConfig
                            ?.voterWeightAddin
                        }
                      />
                      )
                    </span>
                  </div>
                ) : (
                  'No'
                )
              }
            />
            <Section
              icon={<BeakerIcon />}
              name={'Use community max voter weight add‑in'}
              value={
                props.realmAuthority.config.communityTokenConfig
                  ?.maxVoterWeightAddin ? (
                  <div className="flex gap-x-2">
                    Yes
                    <span className="text-white/50 flex-nowrap flex">
                      (
                      <Address
                        address={
                          props.realmAuthority.config.communityTokenConfig
                            ?.maxVoterWeightAddin
                        }
                      />
                      )
                    </span>
                  </div>
                ) : (
                  'No'
                )
              }
            />
          </div>
        </div>
        {councilRulesSupported && (
          <div>
            <div className="flex items-center space-x-2 text-fgd-1 mb-4">
              <OfficeBuildingIcon className="h-5 w-5" />
              <div className="font-bold">Council Rules</div>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {
                <Section
                  icon={<TokenIcon />}
                  name={'Token type'}
                  value={
                    props.realmAuthority.config.councilTokenConfig
                      ? { 0: 'Liquid', 1: 'Membership', 2: 'Disabled' }[
                          props.realmAuthority.config.councilTokenConfig
                            .tokenType
                        ]
                      : 'Liquid'
                  }
                />
              }
              <Section
                icon={<BeakerIcon />}
                name={'Use council voter weight add‑in'}
                value={
                  props.realmAuthority.config.councilTokenConfig
                    ?.voterWeightAddin ? (
                    <div className="flex gap-x-2">
                      Yes
                      <span className="text-white/50 flex-nowrap flex">
                        (
                        <Address
                          address={
                            props.realmAuthority.config.councilTokenConfig
                              ?.voterWeightAddin
                          }
                        />
                        )
                      </span>
                    </div>
                  ) : (
                    'No'
                  )
                }
              />
              <Section
                icon={<BeakerIcon />}
                name={'Use council max voter weight add‑in'}
                value={
                  props.realmAuthority.config.councilTokenConfig
                    ?.maxVoterWeightAddin ? (
                    <div className="flex gap-x-2">
                      Yes
                      <span className="text-white/50 flex-nowrap flex">
                        (
                        <Address
                          address={
                            props.realmAuthority.config.councilTokenConfig
                              ?.maxVoterWeightAddin
                          }
                        />
                        )
                      </span>
                    </div>
                  ) : (
                    'No'
                  )
                }
              />
            </div>
          </div>
        )}
      </div>
      {isNftMode && <NFTVotePluginSettingsDisplay className="mt-24" />}
    </div>
  )
}
