import Select from '@components/inputs/Select'
import { Governance } from '@solana/spl-governance'
import {
  ProgramAccount,
  getNativeTreasuryAddress,
} from '@solana/spl-governance'
import {
  getMintAccountLabelInfo,
  getSolAccountLabel,
  getTokenAccountLabelInfo,
} from '@utils/tokens'
import React, { cloneElement, useEffect, useContext, useState } from 'react'
import { AssetAccount, AccountType } from '@utils/uiTypes/assets'
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
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import Tooltip from '@components/Tooltip'
import TokenIcon from '@components/treasuryV2/icons/TokenIcon'
import { AssetType } from 'models/treasury/Asset'
import CommunityMintIcon from '@components/treasuryV2/icons/CommunityMintIcon'
import CouncilMintIcon from '@components/treasuryV2/icons/CouncilMintIcon'
import MintIcon from '@components/treasuryV2/icons/MintIcon'
import { getAccountName } from '@components/instructions/tools'

function exists<T>(item: T | null | undefined): item is T {
  return item !== null || item !== undefined
}

function RulesPill(props: { icon: JSX.Element; value: string; label: string }) {
  return (
    <Tooltip content={props.label}>
      <div className="flex items-center space-x-1 bg-bkg-3 px-2 py-1 rounded text-xs">
        {cloneElement(props.icon, {
          className: cx(props.icon.props.className, 'h-4 w-4'),
        })}
        <div>{props.value}</div>
      </div>
    </Tooltip>
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
  type,
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
  type?: 'mint' | 'token' | 'wallet'
}) => {
  const realm = useRealm()
  const treasuryInfo = useTreasuryInfo()
  const { voteByCouncil } = useContext(NewProposalContext)
  const [wallets, setWallets] = useState<
    {
      account: AssetAccount
      governance: PublicKey
      walletAddress: PublicKey
    }[]
  >([])
  const [mints, setMints] = useState<
    {
      account: AssetAccount
      info: ReturnType<typeof getMintAccountLabelInfo>
    }[]
  >([])
  const [tokens, setTokens] = useState<
    {
      account: AssetAccount
      info:
        | ReturnType<typeof getTokenAccountLabelInfo>
        | ReturnType<typeof getSolAccountLabel>
    }[]
  >([])
  const programId = realm.realmInfo?.programId

  useEffect(() => {
    setMints(
      governedAccounts
        .filter((account) => account.type === AccountType.MINT)
        .map((account) => ({
          account,
          info: getMintAccountLabelInfo(account),
        }))
    )
    setTokens(
      governedAccounts
        .filter((account) => account.isSol || account.isToken)
        .map((account) => ({
          account,
          info: account.isSol
            ? getSolAccountLabel(account)
            : getTokenAccountLabelInfo(account),
        }))
    )

    if (programId) {
      const governances = new Set<string>([])

      for (const account of governedAccounts) {
        governances.add(account.governance.pubkey.toBase58())
      }

      Promise.all(
        governedAccounts.map((account) => {
          return getNativeTreasuryAddress(
            programId,
            account.governance.pubkey
          ).then((walletAddress) => ({
            account,
            governance: account.governance.pubkey,
            walletAddress,
          }))
        })
      ).then((rawWallets) => {
        const visited = new Set<string>()
        const deduped: typeof rawWallets = []

        for (const wallet of rawWallets) {
          if (!visited.has(wallet.walletAddress.toBase58())) {
            visited.add(wallet.walletAddress.toBase58())
            deduped.push(wallet)
          }
        }

        setWallets(deduped)
      })
    }
  }, [governedAccounts, programId])

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

    const accountName = value.isSol
      ? getSolAccountLabel(value).tokenAccountName
      : value.isToken
      ? getTokenAccountLabelInfo(value).tokenAccountName
      : getMintAccountLabelInfo(value).mintAccountName

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

  function getProgramView(value?: AssetAccount | null, selected = false) {
    if (!value) {
      return null
    }

    const wallet = wallets.find(({ account }) =>
      account.pubkey.equals(value.pubkey)
    )

    if (!wallet) {
      return null
    }

    const accountName = value.isSol
      ? getSolAccountLabel(value).tokenAccountName
      : value.isToken
      ? getTokenAccountLabelInfo(value).tokenAccountName
      : getMintAccountLabelInfo(value).mintAccountName

    const walletInfo = RE.isOk(treasuryInfo)
      ? treasuryInfo.data.wallets.find(
          (wallet) =>
            wallet.governanceAddress === value.governance.pubkey.toBase58()
        )
      : null

    const programName = getAccountName(value.governance.account.governedAccount)

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

          <div className="space-y-0.5 text-xs text-fgd-3">
            Program:{' '}
            {programName
              ? programName
              : abbreviateAddress(value.governance.account.governedAccount)}
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

  function getTokenView(value?: AssetAccount | null) {
    if (!value) {
      return null
    }

    const accountInfo = value.isSol
      ? getSolAccountLabel(value)
      : getTokenAccountLabelInfo(value)

    return (
      <div className="grid grid-cols-[40px,1fr] gap-x-4 text-fgd-1 items-center w-full">
        <div>
          <TokenIcon className="h-10 w-10 fill-white/50 stroke-none" />
        </div>
        <div>
          {accountInfo.tokenAccountName && (
            <div className="mb-0.5">{accountInfo.tokenAccountName}</div>
          )}
          <div className="mb-2 text-fgd-3 text-xs">
            {accountInfo.tokenAccount}
          </div>
          <div className="flex space-x-3 text-xs text-fgd-3">
            {accountInfo.tokenName && (
              <div className="flex items-center">
                Token:
                <span className="ml-1 text-fgd-1">{accountInfo.tokenName}</span>
              </div>
            )}
            {accountInfo.amount && (
              <div className="flex items-center">
                Bal:
                <span className="ml-1 text-fgd-1">{accountInfo.amount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  function getMintView(value?: AssetAccount | null) {
    if (!value) {
      return null
    }

    const accountInfo = getMintAccountLabelInfo(value)

    const wallet = wallets.find(({ account }) =>
      account.pubkey.equals(value.pubkey)
    )

    if (!wallet) {
      return null
    }

    const walletInfo = RE.isOk(treasuryInfo)
      ? treasuryInfo.data.wallets.find(
          (wallet) =>
            wallet.governanceAddress === value.governance.pubkey.toBase58()
        )
      : null

    const mintInfo = walletInfo?.assets.find(
      (asset) =>
        asset.type === AssetType.Mint &&
        asset.address === value.pubkey.toBase58()
    )

    const mintType =
      mintInfo && mintInfo.type === AssetType.Mint
        ? mintInfo.tokenRole
        : undefined

    return (
      <div className="grid grid-cols-[40px,1fr] gap-x-4 text-fgd-1 items-center w-full">
        <div>
          {mintType === 'community' ? (
            <CommunityMintIcon className="h-10 w-10 fill-none stroke-white/50" />
          ) : mintType === 'council' ? (
            <CouncilMintIcon className="h-10 w-10 fill-none stroke-white/50" />
          ) : (
            <MintIcon className="h-10 w-10 fill-white/50 stroke-none" />
          )}
        </div>
        <div>
          {accountInfo.mintAccountName && (
            <div className="mb-0.5">{accountInfo.mintAccountName}</div>
          )}
          <div className="mb-2 text-fgd-3 text-xs">{accountInfo.account}</div>
          <div className="flex space-x-3 text-xs text-fgd-3">
            {mintType === 'community' && (
              <div className="text-fgd-1">Community Token Mint</div>
            )}
            {mintType === 'council' && (
              <div className="text-fgd-1">Council Token Mint</div>
            )}
            {accountInfo.tokenName && (
              <div className="flex items-center">
                Token:
                <span className="ml-1 text-fgd-1">{accountInfo.tokenName}</span>
              </div>
            )}
            {accountInfo.amount && (
              <div className="flex items-center">
                Bal:
                <span className="ml-1 text-fgd-1">{accountInfo.amount}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    )
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

  const walletInfo = RE.isOk(treasuryInfo)
    ? treasuryInfo.data.wallets.find(
        (wallet) =>
          wallet.governanceAddress === value?.governance.pubkey.toBase58()
      )
    : null

  return (
    <div>
      <Select
        label={label}
        onChange={onChange}
        componentLabel={
          type === 'token'
            ? getTokenView(value)
            : type === 'mint'
            ? getMintView(value)
            : value?.type === AccountType.PROGRAM
            ? getProgramView(value, true)
            : getWalletView(value, true)
        }
        placeholder="Please select..."
        value={value?.governance?.account.governedAccount.toBase58()}
        error={error}
        noMaxWidth={noMaxWidth}
      >
        {type === 'token'
          ? tokens
              .filter((token) =>
                !shouldBeGoverned
                  ? !shouldBeGoverned
                  : token.account?.governance?.pubkey.toBase58() ===
                    governance?.pubkey?.toBase58()
              )
              .map((token) => {
                const label = getTokenView(token.account)

                return label ? (
                  <Select.Option
                    className="border-red"
                    key={token.account.pubkey.toBase58()}
                    value={token.account}
                  >
                    {label}
                  </Select.Option>
                ) : null
              })
              .filter(exists)
          : type === 'mint'
          ? mints
              .filter((mint) =>
                !shouldBeGoverned
                  ? !shouldBeGoverned
                  : mint.account?.governance?.pubkey.toBase58() ===
                    governance?.pubkey?.toBase58()
              )
              .map((mint) => {
                const label = getMintView(mint.account)

                return label ? (
                  <Select.Option
                    className="border-red"
                    key={mint.account.pubkey.toBase58()}
                    value={mint.account}
                  >
                    {label}
                  </Select.Option>
                ) : null
              })
              .filter(exists)
          : wallets
              .filter((wallet) =>
                !shouldBeGoverned
                  ? !shouldBeGoverned
                  : wallet.account?.governance?.pubkey.toBase58() ===
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
      {value && walletInfo && (
        <div className="text-white/50 max-w-lg mt-2">
          <div className="flex items-center space-x-1 justify-end">
            {walletInfo.rules.common?.maxVotingTime && (
              <RulesPill
                icon={<ClockIcon className="stroke-current fill-none" />}
                label="Max Voting Time"
                value={durationStr(walletInfo.rules.common.maxVotingTime, true)}
              />
            )}
            {voteByCouncil && exists(walletInfo.rules.council) ? (
              <RulesPill
                icon={<ScaleIcon className="stroke-current fill-none" />}
                label="Council Vote Threshold"
                value={walletInfo.rules.council.voteThresholdPercentage + '%'}
              />
            ) : !voteByCouncil && exists(walletInfo.rules.community) ? (
              <RulesPill
                icon={<ScaleIcon className="stroke-current fill-none" />}
                label="Community Vote Threshold"
                value={walletInfo.rules.community.voteThresholdPercentage + '%'}
              />
            ) : null}
            {voteByCouncil && exists(walletInfo.rules.council) ? (
              <RulesPill
                icon={<HandIcon className="stroke-current fill-none" />}
                label="Council Vote Tipping"
                value={voteTippingText(walletInfo.rules.council.voteTipping)}
              />
            ) : !voteByCouncil && exists(walletInfo.rules.community) ? (
              <RulesPill
                icon={<HandIcon className="stroke-current fill-none" />}
                label="Community Vote Tipping"
                value={voteTippingText(walletInfo.rules.community.voteTipping)}
              />
            ) : null}
          </div>
        </div>
      )}
    </div>
  )
}

export default GovernedAccountSelect
