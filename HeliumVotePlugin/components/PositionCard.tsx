import React, { useCallback, useState } from 'react'
import useRealm from '@hooks/useRealm'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import useWalletStore from 'stores/useWalletStore'
import { fmtMintAmount } from '@tools/sdk/units'
import { PositionWithMeta } from '../sdk/types'
import tokenPriceService from '@utils/services/tokenPrice'
import { abbreviateAddress } from '@utils/formatting'
import { useNft } from '@hooks/useNft'
import { calcPositionVotingPower } from 'HeliumVotePlugin/utils/calcPositionVotingPower'
import {
  daysToSecs,
  getMinDurationFmt,
  getTimeLeftFromNowFmt,
  secsToDays,
} from 'VoteStakeRegistry/tools/dateTools'
import { useUnixNow } from '@hooks/useUnixNow'
import { BN } from '@project-serum/anchor'
import Button from '@components/Button'
import { useUnlockPosition } from 'HeliumVotePlugin/hooks/useUnlockPosition'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'
import {
  LockTokensModal,
  LockTokensModalFormValues,
} from 'HeliumVotePlugin/components/LockTokensModal'
import { calcLockupMultiplier } from 'HeliumVotePlugin/utils/calcLockupMultiplier'
import { useExtendPosition } from 'HeliumVotePlugin/hooks/useExtendPosition'

export interface PositionCardProps {
  position: PositionWithMeta
}

export const PositionCard: React.FC<PositionCardProps> = ({ position }) => {
  const { unixNow = 0 } = useUnixNow()
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false)
  // const [isDelegateModalOpen, setIsDelegateModalOpen] = useState(false)
  // const [isTransferModalOpen, setIsTransferModalOpen] = useState(false)
  const { realm, realmInfo, tokenRecords, ownTokenRecord } = useRealm()
  const [
    currentClient,
    vsrClient,
    vsrRegistrar,
    vsrRegistrarPk,
  ] = useVotePluginsClientStore((s) => [
    s.state.currentRealmVotingClient,
    s.state.heliumVsrClient,
    s.state.heliumVsrRegistrar,
    s.state.voteStakeRegistryRegistrarPk,
  ])

  const {
    loading: isExtending,
    error: extendingError,
    extendPosition,
  } = useExtendPosition({
    registrarPk: vsrRegistrarPk || undefined,
  })

  const {
    loading: isUnlocking,
    error: unlockingError,
    unlockPosition,
  } = useUnlockPosition({
    registrarPk: vsrRegistrarPk || undefined,
  })

  const [isLoading, getPositions] = useHeliumVsrStore((s) => [
    s.state.isLoading,
    s.getPositions,
  ])

  const { _error, loading, _nft } = useNft(position.mint)
  const [
    connection,
    wallet,
    { fetchRealm, fetchWalletTokenAccounts },
  ] = useWalletStore((s) => [s.connection.current, s.current, s.actions])

  const lockup = position.lockup
  const lockupKind = Object.keys(lockup.kind)[0] as string
  const lockupExpired =
    lockupKind !== 'constant' && lockup.endTs.sub(new BN(unixNow)).lt(new BN(0))
  const votingPower = calcPositionVotingPower({
    position,
    registrar: vsrRegistrar as any,
  })
  const lockedTokens = fmtMintAmount(
    position.votingMint.mint.account,
    position.amountDepositedNative
  )
  const isRealmCommunityMint =
    position.votingMint.mint.publicKey.toBase58() ===
    realm?.account.communityMint.toBase58()
  const isConstant = lockupKind === 'constant'

  const tokenInfo = tokenPriceService.getTokenInfo(
    position.votingMint.mint.publicKey.toBase58()
  )

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
      connection,
    })
  }

  const handleUnlock = async () => {
    await unlockPosition({ position })

    if (!unlockingError) {
      await refetchState()
    }
  }

  const handleExtendTokens = async (values: LockTokensModalFormValues) => {
    await extendPosition({
      position,
      lockupPeriodsInDays: values.lockupPeriodInDays,
    })

    if (!extendingError) {
      await refetchState()
    }
  }

  const CardLabel = ({ label, value }) => {
    return (
      <div className="flex flex-col w-1/2 py-2">
        <p className="text-xs text-fgd-2">{label}</p>
        <p className="font-bold text-fgd-1">{value}</p>
      </div>
    )
  }

  return (
    <div className="border border-fgd-4 rounded-lg flex flex-col">
      {loading ? (
        <>
          <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
          <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
          <div className="animate-pulse bg-bkg-3 col-span-1 h-44 rounded-md" />
        </>
      ) : (
        <>
          <div className="bg-bkg-3 px-4 py-4 pr-16 rounded-md rounded-b-none flex items-center">
            {tokenInfo?.logoURI && (
              <img className="w-8 h-8 mr-2" src={tokenInfo?.logoURI}></img>
            )}
            <h3 className="hero-text mb-0">
              {lockedTokens}{' '}
              {!tokenInfo?.logoURI &&
                abbreviateAddress(position.votingMint.mint.publicKey)}
              <span className="font-normal text-xs text-fgd-3">
                {tokenInfo?.symbol}
              </span>
            </h3>
          </div>
          <div
            className="p-4 rounded-lg flex flex-col h-full"
            style={{ minHeight: '220px' }}
          >
            <div className="flex flex-row flex-wrap">
              <CardLabel
                label="Lockup Type"
                value={lockupKind.charAt(0).toUpperCase() + lockupKind.slice(1)}
              />
              {isRealmCommunityMint && (
                <CardLabel
                  label="Vote Multiplier"
                  value={(votingPower.isZero()
                    ? 0
                    : votingPower.toNumber() /
                      position.amountDepositedNative.toNumber()
                  ).toFixed(2)}
                />
              )}
              <CardLabel
                label={isConstant ? 'Min. Duration' : 'Time left'}
                value={
                  isConstant
                    ? getMinDurationFmt(position.lockup as any)
                    : getTimeLeftFromNowFmt(position.lockup as any)
                }
              />
            </div>
            {lockupExpired ? (
              <Button
                style={{ marginTop: 'auto' }}
                className="w-full"
                onClick={console.log}
              >
                Close Deposit
              </Button>
            ) : (
              <>
                {isConstant ? (
                  <Button
                    style={{ marginTop: 'auto' }}
                    className="w-full"
                    onClick={handleUnlock}
                    isLoading={isUnlocking}
                    disabled={isUnlocking}
                  >
                    Start Unlock
                  </Button>
                ) : (
                  <Button
                    style={{ marginTop: 'auto' }}
                    onClick={() => setIsExtendModalOpen(true)}
                  >
                    Extend
                  </Button>
                )}
              </>
            )}
          </div>
        </>
      )}
      {isExtendModalOpen && (
        <LockTokensModal
          mode="extend"
          isOpen={isExtendModalOpen}
          minLockupTimeInDays={Math.ceil(
            secsToDays(position.lockup.endTs.sub(new BN(unixNow)).toNumber())
          )}
          maxLockupAmount={position.amountDepositedNative.toNumber()}
          calcMultiplierFn={handleCalcLockupMultiplier}
          onClose={() => setIsExtendModalOpen(false)}
          onSubmit={handleExtendTokens}
        />
      )}
    </div>
  )
}
