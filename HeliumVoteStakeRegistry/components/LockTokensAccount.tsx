import React, { useMemo, useState } from 'react'
import { BN } from '@project-serum/anchor'
import {
  LightningBoltIcon,
  LinkIcon,
  LockClosedIcon,
} from '@heroicons/react/solid'
import useRealm from '@hooks/useRealm'
import {
  fmtMintAmount,
  getMintDecimalAmountFromNatural,
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
import { usePositions } from '../hooks/usePositions'
import { LockCommunityTokensBtn } from './LockCommunityTokensBtn'
import { LockTokensModal } from './LockTokensModal'

// const unlockedTypes = ['none']
export const LockTokensAccount: React.FC<{
  tokenOwnerRecordPk: string | string[] | undefined
  children: React.ReactNode
}> = ({ tokenOwnerRecordPk, children }) => {
  const { realm, realmTokenAccount, realmInfo, mint, councilMint } = useRealm()
  const [isLoading, setIsLoading] = useState(false)
  const [isOwnerOfPositions, setIsOwnerOfPositions] = useState(true)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [votingPower, setVotingPower] = useState<BN>(new BN(0))
  const { positions } = usePositions()
  const [connection, wallet, connected] = useWalletStore((s) => [
    s.connection.current,
    s.current,
    s.connected,
  ])
  // const tokenOwnerRecordWalletPk = Object.keys(tokenRecords)?.find(
  //   (key) => tokenRecords[key]?.pubkey?.toBase58() === tokenOwnerRecordPk
  // )
  const mainBoxesClasses = 'bg-bkg-1 col-span-1 p-4 rounded-md'
  // const isNextSameRecord = (x, next) => {
  //   const nextType = Object.keys(next.lockup.kind)[0]
  //   return (
  //     x.mintPk.toBase58() === next.mint.publicKey.toBase58() &&
  //     ((!unlockedTypes.includes(x.lockUpKind) &&
  //       !unlockedTypes.includes(nextType)) ||
  //       (unlockedTypes.includes(x.lockUpKind) &&
  //         unlockedTypes.includes(nextType)))
  //   )
  // }

  const hasTokensInWallet =
    realmTokenAccount && realmTokenAccount.account.amount.gt(new BN(0))

  const availableTokens =
    hasTokensInWallet && mint
      ? fmtMintAmount(mint, realmTokenAccount?.account.amount as BN)
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

  const tokenName = realm?.account.communityMint
    ? getMintMetadata(realm?.account.communityMint)?.name ||
      tokenPriceService.getTokenInfo(realm?.account.communityMint.toBase58())
        ?.name ||
      abbreviateAddress(realm?.account.communityMint)
    : ''

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

          <div className="ml-auto flex flex-row">
            <LockCommunityTokensBtn onClick={() => setIsLockModalOpen(true)} />
          </div>
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
                      <div className={mainBoxesClasses}>
                        <p className="text-fgd-3">Votes</p>
                        <span className="hero-text">
                          {votingPower.toNumber()}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className={mainBoxesClasses}>
                    <p className="text-fgd-3">{`${tokenName} Available`}</p>
                    <span className="hero-text">
                      {availableTokens}
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
                  {/* iterate over positions and calc */}
                  <div className={mainBoxesClasses}>
                    <p className="text-fgd-3">Locked</p>
                    <span className="hero-text">
                      0
                      <span className="font-normal text-xs ml-2">
                        <span className="text-fgd-3">≈</span>${0}
                      </span>
                    </span>
                  </div>
                  <div className="border border-fgd-4 flex flex-col items-center justify-center p-6 rounded-lg">
                    <LightningBoltIcon className="h-8 mb-2 text-primary-light w-8" />
                    <p className="flex text-center pb-6">
                      Increase your voting power by<br></br> locking your
                      tokens.
                    </p>
                    <Button onClick={() => setIsLockModalOpen(true)}>
                      <div className="flex items-center">
                        <LockClosedIcon className="h-5 mr-1.5 w-5" />
                        <span>Lock Tokens</span>
                      </div>
                    </Button>
                  </div>
                </>
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
            onClose={() => setIsLockModalOpen(false)}
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
