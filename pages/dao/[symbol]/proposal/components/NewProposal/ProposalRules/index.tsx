import RuleDraft from '@carbon/icons-react/lib/RuleDraft'

import { SectionBlock } from '@components/core/SectionBlock'
import { SectionHeader } from '@components/core/SectionHeader'
import { ValueBlock } from '@components/core/ValueBlock'
import cx from 'classnames'
import * as RE from '@utils/uiTypes/Result'
import { AssetAccount } from '@utils/uiTypes/assets'
import Select from '@components/inputs/Select'
import { PublicKey } from '@solana/web3.js'
import {
  getMintAccountLabelInfo,
  getSolAccountLabel,
  getTokenAccountLabelInfo,
} from '@utils/tokens'
import { getAccountName } from '@components/instructions/tools'
import useTreasuryInfo from '@hooks/useTreasuryInfo'
import UnselectedWalletIcon from '@components/treasuryV2/icons/UnselectedWalletIcon'
import { abbreviateAddress } from '@utils/formatting'
import AssetsPreviewIconList from '@components/treasuryV2/WalletList/WalletListItem/AssetsPreviewIconList'
import { useState } from 'react'

interface Props {
  className?: string
}

export function ProposalRules(props: Props) {
  // const { governedTokenAccountsWithoutNfts } = useGovernanceAssets()
  const [value] = useState<AssetAccount>()
  // const [error] = useState('')
  const [form, setForm] = useState({
    governedTokenAccount: undefined,
  })
  const [wallets, setWallets] = useState<
    {
      account: AssetAccount
      governance: PublicKey
      walletAddress: PublicKey
    }[]
  >([])
  const [formErrors, setFormErrors] = useState({})
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const treasuryInfo = useTreasuryInfo(false)

  function getWalletView(value?: AssetAccount | null, selected = false) {
    if (!value) {
      return null
    }

    const wallet = wallets.find(({ account }) =>
      account.pubkey.equals(value.pubkey)
    )

    if (!wallet) {
      return null
    }

    const name = value.isSol
      ? getSolAccountLabel(value).tokenAccountName
      : value.isToken
      ? getTokenAccountLabelInfo(value).tokenAccountName
      : getMintAccountLabelInfo(value).mintAccountName
    const accountName = name ? name : getAccountName(wallet.walletAddress)
    const walletInfo = RE.isOk(treasuryInfo)
      ? treasuryInfo.data.wallets.find(
          (wallet) =>
            wallet.governanceAddress === value.governance.pubkey.toBase58()
        )
      : null

    return (
      <div className="grid grid-cols-[40px,1fr,max-content] gap-x-4 text-fgd-1 items-center w-full">
        <div>
          <UnselectedWalletIcon className="h-10 w-10 stroke-white/50" />
        </div>
        <div>
          {accountName ? (
            <div className="mb-0.5 truncate w-full">{accountName}</div>
          ) : (
            <div className="mb-0.5 truncate w-full">
              {abbreviateAddress(wallet.walletAddress)}
            </div>
          )}
          <div className="space-y-0.5 text-xs text-fgd-3">
            <div>Rules: {abbreviateAddress(value.governance.pubkey)}</div>
          </div>
        </div>
        {walletInfo ? (
          <div className={cx('flex flex-col items-end', selected && 'pr-2')}>
            <div className="font-bold text-white text-sm mb-1">
              ${walletInfo.totalValue.toFormat(2)}
            </div>
            <AssetsPreviewIconList
              showMints
              showRealmAuthority
              assets={walletInfo.assets}
              className="h-4"
            />
          </div>
        ) : (
          <div className={cx('flex flex-col items-end', selected && 'pr-2')}>
            <div className="bg-bkg-2 px-2 py-1 rounded h-4 w-12 animate-pulse mb-1">
              &nbsp;
            </div>
            <div className="bg-bkg-2 px-2 py-1 rounded h-4 w-16 animate-pulse">
              &nbsp;
            </div>
          </div>
        )}
      </div>
    )
  }
  // const shouldBeGoverned = !!(index !== 0 && governance)
  console.log(value, formErrors)
  return (
    <SectionBlock className={props.className}>
      <SectionHeader
        className="mb-8"
        icon={<RuleDraft />}
        text="Proposal Rules"
      />
      <ValueBlock
        description="These rules determine voting duration, voting threshold, and vote tipping."
        title="Which wallet's rules should this proposal follow"
      >
        <Select
          label={'Wallet'}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'governedTokenAccount' })
          }}
          componentLabel={getWalletView(value, true)}
          placeholder="Please select..."
          value={value?.pubkey}
          error={formErrors['governedTokenAccount']}
          // noMaxWidth={noMaxWidth}
        >
          {wallets
            .filter(
              (wallet) =>
                // !shouldBeGoverned
                //   ? !shouldBeGoverned
                //   :
                wallet.account?.governance?.pubkey.toBase58() ===
                governance?.pubkey?.toBase58()
            )
            .map((wallet) => {
              const label =
                wallet.account.type === AccountType.PROGRAM
                  ? getProgramView(wallet.account)
                  : getWalletView(wallet.account)

              return label ? (
                <Select.Option
                  className="border-red"
                  key={wallet.account.pubkey.toBase58()}
                  value={wallet.account}
                >
                  {label}
                </Select.Option>
              ) : null
            })
            .filter(exists)}
        </Select>
        {/* <div className="grid grid-cols-[100px,1fr] gap-x-2 items-center">
          <SliderValue
            min={1}
            max={7}
            value={props.maxVoteDays}
            units={ntext(props.maxVoteDays, 'Day')}
            onChange={props.onMaxVoteDaysChange}
          />
          <Slider
            min={1}
            max={7}
            value={props.maxVoteDays}
            onChange={props.onMaxVoteDaysChange}
          />
        </div> */}
      </ValueBlock>
    </SectionBlock>
  )
}
