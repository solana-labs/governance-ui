import React, { useState } from 'react'
import useRealm from '@hooks/useRealm'
import { BN } from '@project-serum/anchor'
import useWalletStore from 'stores/useWalletStore'
import PreviousRouteBtn from '@components/PreviousRouteBtn'
import { TokenDeposit } from '@components/TokenBalance/TokenBalanceCard'
import { GoverningTokenRole } from '@solana/spl-governance'
import DepositCommunityTokensBtn from 'VoteStakeRegistry/components/TokenBalance/DepositCommunityTokensBtn'
import WithDrawCommunityTokens from 'VoteStakeRegistry/components/TokenBalance/WithdrawCommunityTokensBtn'
import InlineNotification from '@components/InlineNotification'
import {
  LightningBoltIcon,
  LinkIcon,
  LockClosedIcon,
} from '@heroicons/react/solid'

// const unlockedTypes = ['none']
export const LockTokensAccount: React.FC<{
  tokenOwnerRecordPk: string | string[] | undefined
  children: React.ReactNode
}> = ({ tokenOwnerRecordPk, children }) => {
  const {
    realm,
    realmInfo,
    mint,
    tokenRecords,
    councilMint,
    config,
  } = useRealm()
  const [isLoading, setIsLoading] = useState(false)
  const [isOwnerOfPositions, setIsOwnerOfPositions] = useState(true)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [votingPower, setVotingPower] = useState<BN>(new BN(0))
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
            <DepositCommunityTokensBtn
              inAccountDetails={true}
              className="mr-3"
            />
            <WithDrawCommunityTokens />
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
                  {/* iterate over positions and calc */}
                  <div className={mainBoxesClasses}>
                    <p className="text-fgd-3">Deposited</p>
                    <span className="hero-text">
                      0
                      <span className="font-normal text-xs ml-2">
                        <span className="text-fgd-3">≈</span>${0}
                      </span>
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
