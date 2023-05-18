import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useAsync } from 'react-async-hook'
import { BN } from '@coral-xyz/anchor'
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
import { GoverningTokenRole } from '@solana/spl-governance'
import InlineNotification from '@components/InlineNotification'
import tokenPriceService from '@utils/services/tokenPrice'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import { abbreviateAddress } from '@utils/formatting'
import Button from '@components/Button'
import { daysToSecs } from '@utils/dateTools'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { LockCommunityTokensBtn } from './LockCommunityTokensBtn'
import { LockTokensModal, LockTokensModalFormValues } from './LockTokensModal'
import { useCreatePosition } from '../hooks/useCreatePosition'
import { calcLockupMultiplier } from '../utils/calcLockupMultiplier'
import { VotingPowerBox } from './VotingPowerBox'
import { PositionCard } from './PositionCard'
import useHeliumVsrStore from '../hooks/useHeliumVsrStore'
import { PublicKey } from '@solana/web3.js'
import { notify } from '@utils/notifications'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useSubDaos } from 'HeliumVotePlugin/hooks/useSubDaos'
import { useAddressQuery_CommunityTokenOwner } from '@hooks/queries/addresses/tokenOwner'
import { ClaimAllRewardsBtn } from './ClaimAllRewardsBtn'
import { useClaimAllPositionsRewards } from 'HeliumVotePlugin/hooks/useClaimAllPositionsRewards'

export const LockTokensAccount: React.FC<{
  tokenOwnerRecordPk: string | string[] | undefined
  children: React.ReactNode
}> = (props) => {
  const { error: createError, createPosition } = useCreatePosition()
  const {
    error: claimingRewardsError,
    claimAllPositionsRewards,
  } = useClaimAllPositionsRewards()
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const { data: tokenOwnerRecordPk } = useAddressQuery_CommunityTokenOwner()
  const { fetchRealm, fetchWalletTokenAccounts } = useWalletStore(
    (s) => s.actions
  )

  const {
    mint,
    realm,
    realmTokenAccount,
    realmInfo,
    tokenRecords,
    ownTokenRecord,
    councilMint,
    config,
  } = useRealm()

  const tokenOwnerRecordWalletPk = Object.keys(tokenRecords)?.find(
    (key) =>
      tokenRecords[key]?.pubkey?.toBase58() === tokenOwnerRecordPk?.toBase58()
  )

  const [
    currentClient,
    vsrClient,
    vsrRegistrar,
  ] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.heliumVsrClient,
    s.state.heliumVsrRegistrar,
  ])

  const {
    loading: loadingSubDaos,
    error: subDaosError,
    result: subDaos,
  } = useSubDaos()

  const [
    loading,
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

  const sortedPositions = useMemo(
    () =>
      positions.sort((a, b) => {
        if (a.hasGenesisMultiplier || b.hasGenesisMultiplier) {
          if (b.hasGenesisMultiplier) {
            return a.amountDepositedNative.gt(b.amountDepositedNative) ? 0 : -1
          }
          return -1
        }

        return a.amountDepositedNative.gt(b.amountDepositedNative) ? -1 : 0
      }),
    [positions]
  )

  const positionsWithRewards = useMemo(
    () => positions.filter((p) => p.hasRewards),
    [positions]
  )

  useEffect(() => {
    if (subDaosError) {
      notify({
        type: 'error',
        message: subDaosError.message || 'Unable to fetch subdaos',
      })
    }
  }, [subDaosError])

  useAsync(async () => {
    try {
      if (
        config?.account.communityTokenConfig.voterWeightAddin &&
        realm?.pubkey &&
        wallet?.publicKey &&
        vsrClient
      ) {
        await getPositions({
          votingClient: currentClient,
          realmPk: realm.pubkey,
          communityMintPk: realm.account.communityMint,
          walletPk: tokenOwnerRecordWalletPk
            ? new PublicKey(tokenOwnerRecordWalletPk)
            : wallet.publicKey,
          client: vsrClient,
          connection: connection.current,
        })
      }
    } catch (e) {
      notify({
        type: 'error',
        message: 'Unable to fetch positions',
      })
    }
  }, [props.tokenOwnerRecordPk, tokenOwnerRecordWalletPk, vsrClient])

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
    amountLocked.gte(new BN(0)) && mint && realm?.account.communityMint
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

  const refetchState = async () => {
    fetchWalletTokenAccounts()
    fetchRealm(realmInfo!.programId, realmInfo!.realmId)
    await getPositions({
      votingClient: currentClient,
      realmPk: realm!.pubkey,
      communityMintPk: realm!.account.communityMint,
      walletPk: wallet!.publicKey!,
      client: vsrClient!,
      connection: connection.current,
    })
  }

  const handleLockTokens = async (values: LockTokensModalFormValues) => {
    const { amount, lockupPeriodInDays, lockupKind } = values
    const amountToLock = getMintNaturalAmountFromDecimalAsBN(
      amount,
      mint!.decimals
    )
    await createPosition({
      amount: amountToLock,
      lockupPeriodsInDays: lockupPeriodInDays,
      lockupKind: lockupKind.value,
      tokenOwnerRecordPk:
        tokenRecords[wallet!.publicKey!.toBase58()]?.pubkey || null,
    })

    if (!createError) {
      await refetchState()
    }
  }

  const handleClaimAllRewards = async () => {
    try {
      await claimAllPositionsRewards({ positions: positionsWithRewards })

      if (!claimingRewardsError) {
        await refetchState()
      }
    } catch (e) {
      notify({
        type: 'error',
        message: e.message || 'Unable to claim rewards',
      })
    }
  }

  const mainBoxesClasses = 'bg-bkg-1 col-span-1 p-4 rounded-md'
  const isLoading = loading || loadingSubDaos
  const isSameWallet =
    (connected && !ownTokenRecord) ||
    (connected &&
      !!ownTokenRecord &&
      wallet!.publicKey!.equals(ownTokenRecord!.account.governingTokenOwner))

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

          {isSameWallet && (
            <div className="ml-auto flex flex-row">
              <LockCommunityTokensBtn
                onClick={() => setIsLockModalOpen(true)}
              />
            </div>
          )}
        </div>
        {!isSameWallet && connected && (
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
                  {isSameWallet && (
                    <>
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
                </>
              )}
            </div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="mb-4">Locked Positions</h2>
              {isSameWallet && (
                <ClaimAllRewardsBtn onClick={handleClaimAllRewards} />
              )}
            </div>
            <div
              className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8 ${
                !isSameWallet ? 'opacity-0.8 pointer-events-none' : ''
              }`}
            >
              {!loading &&
                sortedPositions.map((pos, idx) => (
                  <PositionCard
                    key={idx}
                    position={pos}
                    subDaos={subDaos}
                    tokenOwnerRecordPk={
                      tokenRecords[wallet!.publicKey!.toBase58()]?.pubkey ||
                      null
                    }
                    isOwner={isSameWallet}
                  />
                ))}
              {isSameWallet && (
                <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
                  <LightningBoltIcon className="h-8 mb-2 text-primary-light w-8" />
                  <p className="flex text-center pb-6">
                    Increase your voting power by locking your tokens.
                  </p>
                  <Button
                    onClick={() => setIsLockModalOpen(true)}
                    disabled={!hasTokensInWallet}
                    {...(hasTokensInWallet
                      ? {}
                      : {
                          tooltipMessage:
                            "You don't have any governance tokens in your wallet to lock.",
                        })}
                  >
                    <div className="flex items-center">
                      <LockClosedIcon className="h-5 mr-1.5 w-5" />
                      <span>Lock Tokens</span>
                    </div>
                  </Button>
                </div>
              )}
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
            calcMultiplierFn={handleCalcLockupMultiplier}
            onClose={() => setIsLockModalOpen(false)}
            onSubmit={handleLockTokens}
          />
        )}
        <div
          className={`mt-4 ${
            !isSameWallet ? 'opacity-0.8 pointer-events-none' : ''
          }`}
        >
          <TokenDeposit
            mint={councilMint}
            tokenRole={GoverningTokenRole.Council}
            councilVote={true}
            inAccountDetails={true}
          />
        </div>
      </div>
      {connected && isSameWallet && props.children}
    </div>
  )
}
