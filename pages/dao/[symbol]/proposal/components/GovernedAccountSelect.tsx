import Select from '@components/inputs/Select'
import { Governance, GovernanceAccountType } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { getMintAccountLabelInfo } from '@utils/tokens'
import React, { cloneElement, useEffect, useContext } from 'react'
import { AssetAccount } from '@utils/uiTypes/assets'
import UnselectedWalletIcon from '@components/treasuryV2/icons/UnselectedWalletIcon'
import { abbreviateAddress } from '@utils/formatting'
import useTreasuryInfo from '@hooks/useTreasuryInfo'
import AssetsPreviewIconList from '@components/treasuryV2/WalletList/WalletListItem/AssetsPreviewIconList'
import * as RE from '@utils/uiTypes/Result'
import {
  durationStr,
  voteTippingText,
} from '@components/treasuryV2/Details/WalletDetails/Info/Rules'
import { ClockIcon, HandIcon, ScaleIcon } from '@heroicons/react/outline'
import cx from 'classnames'
import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'

function exists<T>(item: T | null | undefined): item is T {
  return item !== null || item !== undefined
}

function RulesPill(props: { icon: JSX.Element; value: string }) {
  return (
    <div className="flex items-center space-x-1 bg-bkg-2 px-2 py-1 rounded text-xs">
      {cloneElement(props.icon, {
        className: cx(props.icon.props.className, 'h-4 w-4'),
      })}
      <div>{props.value}</div>
    </div>
  )
}

const GovernedAccountSelect = ({
  onChange,
  value,
  error,
  governedAccounts = [],
  shouldBeGoverned,
  governance,
  label,
  noMaxWidth,
  autoSelectFirst = true,
}: {
  onChange: (value: unknown) => void
  value?: AssetAccount | null
  error?: string
  governedAccounts: AssetAccount[]
  shouldBeGoverned?: boolean | null
  governance?: ProgramAccount<Governance> | null
  label?: string
  noMaxWidth?: boolean
  autoSelectFirst?: boolean
}) => {
  const treasuryInfo = useTreasuryInfo()
  const { voteByCouncil } = useContext(NewProposalContext)

  function getLabel(value?: AssetAccount | null, selected = false) {
    if (!value) {
      return null
    }

    const accountType = value.governance.account.accountType

    if (value.isSol || value.isToken) {
      return null
    }

    if (
      accountType === GovernanceAccountType.MintGovernanceV1 ||
      accountType === GovernanceAccountType.MintGovernanceV2
    ) {
      const mintInfo = getMintAccountLabelInfo(value)
      const walletInfo =
        RE.isOk(treasuryInfo) &&
        treasuryInfo.data.wallets.find(
          (wallet) =>
            wallet.governanceAddress === value.governance.pubkey.toBase58()
        )

      return (
        <div className="grid grid-cols-[48px,1fr,max-content] gap-x-4 text-fgd-1 items-center w-full">
          <div>
            <UnselectedWalletIcon className="h-12 w-12 stroke-white/50" />
          </div>
          <div>
            {mintInfo.mintAccountName ? (
              <div className="mb-0.5 truncate w-full">
                {mintInfo.mintAccountName}
              </div>
            ) : mintInfo.tokenName ? (
              <div className="mb-0.5 truncate w-full">{mintInfo.tokenName}</div>
            ) : mintInfo.account ? (
              <div className="mb-0.5 truncate w-full">
                {abbreviateAddress(mintInfo.account)}
              </div>
            ) : (
              <div className="mb-0.5 truncate w-full">
                {abbreviateAddress(value.governance.pubkey)}
              </div>
            )}
            <div className="space-y-0.5 text-xs text-fgd-3">
              <div>Rules: {abbreviateAddress(value.governance.pubkey)}</div>
            </div>
          </div>
          {walletInfo &&
            (selected ? (
              <div className="pr-2 text-white/50 space-y-1">
                <div className="flex items-center space-x-1 justify-end">
                  {walletInfo.rules.common?.maxVotingTime && (
                    <RulesPill
                      icon={<ClockIcon className="stroke-current fill-none" />}
                      value={durationStr(
                        walletInfo.rules.common.maxVotingTime,
                        true
                      )}
                    />
                  )}
                  {voteByCouncil && exists(walletInfo.rules.council) ? (
                    <RulesPill
                      icon={<ScaleIcon className="stroke-current fill-none" />}
                      value={
                        walletInfo.rules.council.voteThresholdPercentage + '%'
                      }
                    />
                  ) : !voteByCouncil && exists(walletInfo.rules.community) ? (
                    <RulesPill
                      icon={<ScaleIcon className="stroke-current fill-none" />}
                      value={
                        walletInfo.rules.community.voteThresholdPercentage + '%'
                      }
                    />
                  ) : null}
                  {voteByCouncil && exists(walletInfo.rules.council) ? (
                    <RulesPill
                      icon={<HandIcon className="stroke-current fill-none" />}
                      value={voteTippingText(
                        walletInfo.rules.council.voteTipping
                      )}
                    />
                  ) : !voteByCouncil && exists(walletInfo.rules.community) ? (
                    <RulesPill
                      icon={<HandIcon className="stroke-current fill-none" />}
                      value={voteTippingText(
                        walletInfo.rules.community.voteTipping
                      )}
                    />
                  ) : null}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-right font-bold text-white text-sm mb-1">
                  ${walletInfo.totalValue.toFormat(2)}
                </div>
                <AssetsPreviewIconList
                  assets={walletInfo.assets}
                  className="h-4"
                />
              </div>
            ))}
        </div>
      )
    }
  }

  useEffect(() => {
    if (governedAccounts.length == 1 && autoSelectFirst) {
      //wait for microtask queue to be empty
      setTimeout(() => {
        onChange(governedAccounts[0])
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [JSON.stringify(governedAccounts)])
  return (
    <Select
      label={label}
      onChange={onChange}
      componentLabel={getLabel(value, true)}
      placeholder="Please select..."
      value={value?.governance?.account.governedAccount.toBase58()}
      error={error}
      noMaxWidth={noMaxWidth}
    >
      {governedAccounts
        .filter((x) =>
          !shouldBeGoverned
            ? !shouldBeGoverned
            : x?.governance?.pubkey.toBase58() ===
              governance?.pubkey?.toBase58()
        )
        .map((acc) => {
          const label = getLabel(acc)

          return label ? (
            <Select.Option
              className="border-red"
              key={acc.pubkey.toBase58()}
              value={acc}
            >
              {getLabel(acc)}
            </Select.Option>
          ) : null
        })
        .filter(exists)}
    </Select>
  )
}

export default GovernedAccountSelect
