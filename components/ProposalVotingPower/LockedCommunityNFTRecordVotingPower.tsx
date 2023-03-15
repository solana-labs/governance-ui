import React, { useState, useEffect } from 'react'
import classNames from 'classnames'
import { BigNumber } from 'bignumber.js'
import useRealm from '@hooks/useRealm'
import useProposal from '@hooks/useProposal'
import useWalletStore from 'stores/useWalletStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
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
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'

interface Props {
  className?: string
}

export default function LockedCommunityNFTRecordVotingPower(props: Props) {
  const { fmtUrlWithCluster } = useQueryContext()
  const [amount, setAmount] = useState(new BigNumber(0))
  const {
    councilMint,
    mint,
    realm,
    realmTokenAccount,
    symbol,
    config,
  } = useRealm()
  const { proposal } = useProposal()
  const [connected, wallet] = useWalletStore((s) => [s.connected, s.current])
  const [currentClient] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
  ])
  const [tokenOwnerRecordPk, setTokenOwnerRecordPk] = useState('')
  const loadingPositions = useHeliumVsrStore((s) => s.state.isLoading)
  const votingPower = useHeliumVsrStore((s) => s.state.votingPower)
  const amountLocked = useHeliumVsrStore((s) => s.state.amountLocked)

  useEffect(() => {
    if (mint && votingPower) {
      setAmount(getMintDecimalAmount(mint, votingPower))
    }
  }, [mint, votingPower])

  useEffect(() => {
    const getTokenOwnerRecord = async () => {
      const defaultMint =
        !mint?.supply.isZero() ||
        config?.account.communityTokenConfig.maxVoterWeightAddin
          ? realm!.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm!.account.config.councilMint
          : undefined
      const tokenOwnerRecordAddress = await getTokenOwnerRecordAddress(
        realm!.owner,
        realm!.pubkey,
        defaultMint!,
        currentClient!.walletPk!
      )
      setTokenOwnerRecordPk(tokenOwnerRecordAddress.toBase58())
    }
    if (realm && wallet?.connected && currentClient.walletPk) {
      getTokenOwnerRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    realm?.pubkey.toBase58(),
    wallet?.connected,
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
    currentClient.walletPk?.toBase58(),
  ])

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

  const isSameWallet = wallet!.publicKey!.equals(currentClient.walletPk!)
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
