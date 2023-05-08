import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import useRealm from '@hooks/useRealm'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import { fmtMintAmount, getMintDecimalAmount } from '@tools/sdk/units'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import Tooltip from '@components/Tooltip'
import { ChevronRightIcon, LightningBoltIcon } from '@heroicons/react/solid'
import { BN } from '@coral-xyz/anchor'
import Link from 'next/link'
import useQueryContext from '@hooks/useQueryContext'
import InlineNotification from '@components/InlineNotification'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwnerRecord'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useUserCommunityTokenOwnerRecord } from '@hooks/queries/tokenOwnerRecord'
import { useRealmQuery } from '@hooks/queries/realm'

interface Props {
  className?: string
}

export default function LockedCommunityNFTRecordVotingPower(props: Props) {
  const { fmtUrlWithCluster } = useQueryContext()
  const [amount, setAmount] = useState(new BigNumber(0))
  const ownTokenRecord = useUserCommunityTokenOwnerRecord().data?.result
  const realm = useRealmQuery().data?.result
  const { mint, realmTokenAccount, symbol } = useRealm()
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { data: tokenOwnerRecordPk } = useAddressQuery_CommunityTokenOwner()
  const [currentClient] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
  ])
  const [
    loadingPositions,
    votingPower,
    amountLocked,
    positions,
    propagatePositions,
  ] = useHeliumVsrStore((s) => [
    s.state.isLoading,
    s.state.votingPower,
    s.state.amountLocked,
    s.state.positions,
    s.propagatePositions,
  ])

  useEffect(() => {
    if (currentClient.heliumVsrVotingPositions.length !== positions.length) {
      propagatePositions({ votingClient: currentClient })
    }
  }, [positions, currentClient, propagatePositions])

  useEffect(() => {
    if (mint && votingPower) {
      setAmount(getMintDecimalAmount(mint, votingPower))
    }
  }, [mint, votingPower])

  const isLoading = loadingPositions || !(votingPower && mint)
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
    !votingPower.isZero() && !amountLocked.isZero() && mint
      ? getMintDecimalAmount(mint, votingPower)
          .div(getMintDecimalAmount(mint, amountLocked))
          .toFixed(2) + 'x'
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

  const isSameWallet =
    (connected && !ownTokenRecord) ||
    (connected &&
      ownTokenRecord &&
      wallet!.publicKey!.equals(ownTokenRecord!.account.governingTokenOwner))

  return (
    <div className={`${props.className} -mt-10`}>
      <div className="mb-4 flex justify-end">
        <Link
          href={fmtUrlWithCluster(
            `/dao/${symbol}/account/${tokenOwnerRecordPk}`
          )}
        >
          <a
            className={`default-transition flex items-center text-fgd-2 text-sm transition-all hover:text-fgd-3 ${
              !connected || !tokenOwnerRecordPk
                ? 'opacity-0 pointer-events-none'
                : ''
            }`}
          >
            View
            <ChevronRightIcon className="flex-shrink-0 h-6 w-6" />
          </a>
        </Link>
      </div>
      {isSameWallet && hasTokensInWallet && connected ? (
        <div className="mb-4">
          <InlineNotification
            desc={`You have ${tokensToShow} ${
              amountLocked ? `more` : ``
            } ${tokenName} available to lock.`}
            type="info"
          />
        </div>
      ) : null}
      {amount.isZero() ? (
        <div className={'text-xs text-white/50'}>
          You do not have any voting power in this dao.
        </div>
      ) : (
        <>
          <div className={'p-3 rounded-md bg-bkg-1'}>
            <div className="text-white/50 text-xs">Votes</div>
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
