import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import useRealm from '@hooks/useRealm'
import useProposal from '@hooks/useProposal'
import useWalletStore from 'stores/useWalletStore'
import useHeliumVsrStore from 'HeliumVoteStakeRegistry/hooks/useHeliumVsrStore'
import { fmtMintAmount, getMintDecimalAmount } from '@tools/sdk/units'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import Tooltip from '@components/Tooltip'
import { ChevronRightIcon, LightningBoltIcon } from '@heroicons/react/solid'
import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import VotingPowerPct from './VotingPowerPct'
import { BN } from '@project-serum/anchor'
import Link from 'next/link'
import useQueryContext from '@hooks/useQueryContext'
import InlineNotification from '@components/InlineNotification'

interface Props {
  className?: string
}

export default function LockedCommunityNFTRecordVotingPower(props: Props) {
  const { fmtUrlWithCluster } = useQueryContext()
  const [amount, setAmount] = useState(new BigNumber(0))
  const { mint, realm, realmTokenAccount, symbol, tokenRecords } = useRealm()
  const { proposal } = useProposal()
  const connected = useWalletStore((s) => s.connected)
  const loadingPositions = useHeliumVsrStore((s) => s.state.isLoading)
  const votingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const amountLocked = useHeliumVsrStore((s) => s.state.amountLocked)
  const wallet = useWalletStore((s) => s.current)

  useEffect(() => {
    if (mint && votingPower) {
      setAmount(getMintDecimalAmount(mint, votingPower))
    }
  }, [mint, votingPower])

  const isLoading = loadingPositions || !(votingPower && mint)

  const currentTokenOwnerRecord =
    wallet && wallet.publicKey
      ? tokenRecords[wallet.publicKey.toBase58()]
      : null

  const tokenOwnerRecordPk = currentTokenOwnerRecord
    ? currentTokenOwnerRecord.pubkey
    : null

  const communityMint = realm?.account.communityMint

  const tokenName =
    getMintMetadata(communityMint)?.name ?? realm?.account.name ?? ''

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const availableTokens =
    hasTokensInWallet && mint
      ? fmtMintAmount(mint, realmTokenAccount?.account.amount as BN)
      : '0'

  const multiplier =
    !votingPower.isZero() && !amountLocked.isZero()
      ? (votingPower.toNumber() / amountLocked.toNumber()).toFixed(2) + 'x'
      : null

  const max =
    realm && proposal && mint
      ? new BigNumber(
          calculateMaxVoteScore(realm, proposal, mint).toString()
        ).shiftedBy(-mint.decimals)
      : null

  const lockTokensFmt =
    amountLocked && mint ? fmtMintAmount(mint, amountLocked) : '0'

  const tokensToShow =
    hasTokensInWallet && realmTokenAccount
      ? fmtMintAmount(mint, realmTokenAccount.account.amount)
      : hasTokensInWallet
      ? availableTokens
      : 0

  if (isLoading) {
    return (
      <div
        className={classNames(props.className, 'rounded-md bg-bkg-1 h-[76px]')}
      />
    )
  }

  return (
    <div className={`${props.className} -mt-10`}>
      {amount.isZero() ? (
        <div className={'text-xs text-white/50'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <>
          <div className="mb-4 flex justify-end">
            <Link
              href={fmtUrlWithCluster(
                `/dao/${symbol}/account/${tokenOwnerRecordPk}`
              )}
            >
              <a
                className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
                  !connected || !tokenOwnerRecordPk
                    ? 'opacity-50 pointer-events-none'
                    : ''
                }`}
              >
                View
                <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
              </a>
            </Link>
          </div>
          {hasTokensInWallet && connected ? (
            <div className="mb-4">
              <InlineNotification
                desc={`You have ${tokensToShow} ${
                  amountLocked ? `more` : ``
                } ${tokenName} available to lock.`}
                type="info"
              />
            </div>
          ) : null}
          <div className={'p-3 rounded-md bg-bkg-1'}>
            <div className="text-white/50 text-xs">{tokenName} Votes</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-white font-bold text-2xl flex items-center">
                {amount.toFormat(2)}{' '}
                {multiplier && (
                  <Tooltip content="Vote Weight Multiplier – Increase your vote weight by locking tokens">
                    <div className="cursor-help flex font-normal items-center ml-3 text-xs rounded-full bg-bkg-3 px-2 py-1">
                      <LightningBoltIcon className="h-3 mr-1 text-primary-light w-3" />
                      {multiplier}
                    </div>
                  </Tooltip>
                )}
              </div>
              {max && !max.isZero() && (
                <VotingPowerPct amount={amount} total={max} />
              )}
            </div>
          </div>
          <div className="pt-4 px-4">
            <p className="flex text-xs">
              <span>{tokenName} Locked</span>
              <span className="font-bold ml-auto text-fgd-1">
                {lockTokensFmt}
              </span>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
