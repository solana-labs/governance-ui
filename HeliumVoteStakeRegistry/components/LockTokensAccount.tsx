import React, { useCallback, useEffect, useState } from 'react'
import { BN } from '@project-serum/anchor'
import {
  LightningBoltIcon,
  LinkIcon,
  LockClosedIcon,
} from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmount,
  getMintDecimalAmountFromNatural,
  getMintNaturalAmountFromDecimalAsBN,
} from '@tools/sdk/units'
import useWalletStore from 'stores/useWalletStore'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import {
  getTokenOwnerRecordAddress,
  GoverningTokenRole,
} from '@solana/spl-governance'
import InlineNotification from '@components/InlineNotification'
import tokenPriceService from '@utils/services/tokenPrice'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { abbreviateAddress } from '@utils/formatting'
import Button from '@components/Button'
import { daysToSecs, secsToDays } from 'VoteStakeRegistry/tools/dateTools'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { LockCommunityTokensBtn } from './LockCommunityTokensBtn'
import { LockTokensModal, LockTokensModalFormValues } from './LockTokensModal'
import { useCreatePosition } from '../hooks/useCreatePosition'
import { calcLockupMultiplier } from '../utils/calcLockupMultiplier'
import VotingPowerBox from 'VoteStakeRegistry/components/TokenBalance/VotingPowerBox'
import { PositionCard } from './PositionCard'
import useHeliumVsrStore from 'HeliumVoteStakeRegistry/hooks/useHeliumVsrStore'
import { Registrar } from 'HeliumVoteStakeRegistry/sdk/types'
import { notify } from '@utils/notifications'
import { PublicKey } from '@solana/web3.js'

export const LockTokensAccount: React.FC<{
  tokenOwnerRecordPk: string | string[] | undefined
  children: React.ReactNode
}> = ({ tokenOwnerRecordPk, children }) => {
  const {
    realm,
    realmTokenAccount,
    realmInfo,
    mint,
    tokenRecords,
    councilMint,
    config,
  } = useRealm()
  const tokenOwnerRecordWalletPk = Object.keys(tokenRecords)?.find(
    (key) => tokenRecords[key]?.pubkey?.toBase58() === tokenOwnerRecordPk
  )
  const [
    vsrClient,
    vsrRegistrar,
    vsrRegistrarPk,
  ] = useVotePluginsClientStore((s) => [
    s.state.heliumVsrClient,
    s.state.voteStakeRegistryRegistrar as Registrar | null,
    s.state.voteStakeRegistryRegistrarPk,
  ])
  const { error, createPosition } = useCreatePosition({
    realm,
    registrarPk: vsrRegistrarPk || undefined,
  })
  const [isOwnerOfPositions, setIsOwnerOfPositions] = useState(true)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [
    connected,
    connection,
    wallet,
    { fetchRealm, fetchWalletTokenAccounts },
  ] = useWalletStore((s) => [
    s.connected,
    s.connection.current,
    s.current,
    s.actions,
  ])
  const [
    isLoading,
    positions,
    votingPower,
    amountLocked,
    getPositions,
  ] = useHeliumVsrStore((s) => [
    s.state.isLoading,
    s.state.positions,
    s.state.votingPower,
    s.state.amountLocked,
    s.getPositions,
  ])

  const handleGetPositions = useCallback(async () => {
    try {
      if (
        config?.account.communityTokenConfig.voterWeightAddin &&
        realm?.pubkey &&
        wallet?.publicKey &&
        vsrClient
      ) {
        await getPositions({
          realmPk: realm.pubkey,
          communityMintPk: realm.account.communityMint,
          walletPk: tokenOwnerRecordWalletPk
            ? new PublicKey(tokenOwnerRecordWalletPk)
            : wallet.publicKey,
          client: vsrClient,
          connection: connection,
        })
      }
    } catch (e) {
      console.log(e)
      notify({
        type: 'error',
        message: "Can't fetch deposits",
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  useEffect(() => {
    ;(async () => {
      await handleGetPositions()
    })()
  }, [vsrClient, handleGetPositions])

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
        wallet!.publicKey!
      )
      setIsOwnerOfPositions(
        tokenOwnerRecordAddress.toBase58() === tokenOwnerRecordPk
      )
    }
    if (realm && wallet?.connected) {
      getTokenOwnerRecord()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realm?.pubkey.toBase58(), wallet?.connected, tokenOwnerRecordPk])

  const communityVotingMintCfg = vsrRegistrar?.votingMints.find((vm) =>
    vm.mint.equals(realm!.account.communityMint)
  )

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const availableTokensDisplay =
    hasTokensInWallet && mint
      ? fmtMintAmount(mint, realmTokenAccount?.account.amount as BN)
      : '0'

  const amountLockedDisplay =
    amountLocked && mint ? fmtMintAmount(mint, amountLocked) : '0'

  const maxLockupAmount =
    hasTokensInWallet && mint
      ? getMintDecimalAmount(
          mint,
          realmTokenAccount?.account.amount as BN
        ).toNumber()
      : 0

  const availableTokensPrice =
    hasTokensInWallet && mint && realm?.account.communityMint
      ? getMintDecimalAmountFromNatural(
          mint,
          realmTokenAccount?.account.amount
        ).toNumber() *
        tokenPriceService.getUSDTokenPrice(
          realm?.account.communityMint.toBase58()
        )
      : 0

  const lockedTokensPrice =
    amountLocked && mint && realm?.account.communityMint
      ? getMintDecimalAmountFromNatural(mint, amountLocked).toNumber() *
        tokenPriceService.getUSDTokenPrice(
          realm?.account.communityMint.toBase58()
        )
      : 0

  const tokenName = realm?.account.communityMint
    ? getMintMetadata(realm?.account.communityMint)?.name ||
      tokenPriceService.getTokenInfo(realm?.account.communityMint.toBase58())
        ?.name ||
      abbreviateAddress(realm?.account.communityMint)
    : ''

  const handleCalcLockupMultiplier = useCallback(
    (lockupPeriodInDays: number) =>
      calcLockupMultiplier({
        lockupSecs: daysToSecs(lockupPeriodInDays),
        registrar: vsrRegistrar,
        realm,
      }),
    [realm, vsrRegistrar]
  )

  const handleLockTokens = async (values: LockTokensModalFormValues) => {
    const { amount, lockupPeriodInDays, lockupType } = values
    const amountToLock = getMintNaturalAmountFromDecimalAsBN(
      amount,
      mint!.decimals
    )

    await createPosition({
      amount: amountToLock,
      periods: lockupPeriodInDays,
      kind: { [lockupType.value]: {} },
    })

    if (!error) {
      fetchWalletTokenAccounts()
      fetchRealm(realmInfo!.programId, realmInfo!.realmId)
      await getPositions({
        realmPk: realm!.pubkey,
        communityMintPk: realm!.account.communityMint,
        walletPk: wallet!.publicKey!,
        client: vsrClient!,
        connection,
      })
    }
  }

  const mainBoxesClasses = 'bg-bkg-1 col-span-1 p-4 rounded-md'
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="bg-bkg-2 rounded-lg p-4 md:p-6 col-span-12">
        <div className="mb-4">
          <PreviousRouteBtn />
        </div>
        <div className="flex items-center justify-between mb-4">
          {realmInfo?.ogImage && (
            <img
              src={realmInfo?.ogImage}
              className="mr-2 rouninded-full w-8 h-8"
            />
          )}
          <h1 className="leading-none flex flex-col mb-0">
            <span className="font-normal text-fgd-2 text-xs mb-2">
              {realmInfo?.displayName}
            </span>
            My governance power{' '}
          </h1>

          {isOwnerOfPositions && (
            <div className="ml-auto flex flex-row">
              <LockCommunityTokensBtn
                onClick={() => setIsLockModalOpen(true)}
              />
            </div>
          )}
        </div>
        {!isOwnerOfPositions && connected && (
          <div className="pb-6">
            <InlineNotification
              desc="You do not own this account"
              type="info"
            />
          </div>
        )}
        {connected ? (
          <div>
            <div className="grid md:grid-cols-3 grid-flow-row gap-4 pb-8">
              {isLoading ? (
                <>
                  <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
                  <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
                  <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
                </>
              ) : (
                <>
                  <div className="col-span-1">
                    {mint && (
                      <VotingPowerBox
                        className={mainBoxesClasses}
                        mint={mint}
                        votingPower={votingPower}
                        votingPowerFromDeposits={amountLocked}
                      />
                    )}
                  </div>
                  <div className={mainBoxesClasses}>
                    <p className="text-fgd-3">{`${tokenName} Available`}</p>
                    <span className="hero-text">
                      {availableTokensDisplay}
                      {availableTokensPrice ? (
                        <span className="font-normal text-xs ml-2">
                          <span className="text-fgd-3">≈</span>$
                          {Intl.NumberFormat('en', {
                            notation: 'compact',
                          }).format(availableTokensPrice)}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className={mainBoxesClasses}>
                    <p className="text-fgd-3">Locked</p>
                    <span className="hero-text">
                      {amountLockedDisplay}
                      <span className="font-normal text-xs ml-2">
                        <span className="text-fgd-3">≈</span>$
                        {Intl.NumberFormat('en', {
                          notation: 'compact',
                        }).format(lockedTokensPrice)}
                      </span>
                    </span>
                  </div>
                </>
              )}
            </div>
            <h2 className="mb-4">Locked Positions</h2>
            <div
              className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 ${
                !isOwnerOfPositions ? 'opacity-0.8 pointer-events-none' : ''
              }`}
            >
              {!isLoading &&
                positions.map((pos, idx) => (
                  <PositionCard key={idx} position={pos} />
                ))}
              <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
                <LightningBoltIcon className="h-8 mb-2 text-primary-light w-8" />
                <p className="flex text-center pb-6">
                  Increase your voting power by<br></br> locking your tokens.
                </p>
                <Button onClick={() => setIsLockModalOpen(true)}>
                  <div className="flex items-center">
                    <LockClosedIcon className="h-5 mr-1.5 w-5" />
                    <span>Lock Tokens</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
            <LinkIcon className="h-6 mb-1 text-primary-light w-6" />
            <span className="text-fgd-1 text-sm">Connect your wallet</span>
          </div>
        )}
        {isLockModalOpen && (
          <LockTokensModal
            isOpen={isLockModalOpen}
            maxLockupAmount={maxLockupAmount}
            minLockupTimeInDays={secsToDays(
              ((communityVotingMintCfg as any)
                ?.minimumRequiredLockupSecs as BN).toNumber() || 0
            )}
            maxLockupTimeInDays={secsToDays(
              ((communityVotingMintCfg as any)
                ?.lockupSaturationSecs as BN).toNumber() || 0
            )}
            calcMultiplierFn={handleCalcLockupMultiplier}
            onClose={() => setIsLockModalOpen(false)}
            onSubmit={handleLockTokens}
          />
        )}
        <div className="mt-4">
          <TokenDeposit
            mint={councilMint}
            tokenRole={GoverningTokenRole.Council}
            councilVote={true}
            inAccountDetails={true}
          />
        </div>
      </div>
      {connected && children}
    </div>
  )
}
