import classNames from 'classnames'

import useDepositStore from 'VoteStakeRegistry/stores/useDepositStore'

import { TokenDeposit } from '@components/TokenBalance/TokenDeposit'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useRealmQuery } from '@hooks/queries/realm'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { GoverningTokenRole } from '@solana/spl-governance'
import { BigNumber } from 'bignumber.js'
import clsx from 'clsx'
import { usePlugins } from 'plugin-library'
import { useMemo } from 'react'

interface Props {
  className?: string
}

export default function PluginVotingPower(props: Props) {
  const realm = useRealmQuery().data?.result

  const mintInfo = useMintInfoByPubkeyQuery(realm?.account.communityMint).data
    ?.result

  const isLoading = useDepositStore((s) => s.state.isLoading)
  const wallet = useWalletOnePointOh()
  const { voteWeight } = usePlugins({
    realmPublicKey: realm?.pubkey,
    governanceMintPublicKey: realm?.account.communityMint,
    walletPublicKey: wallet?.publicKey || undefined,
  })

  const formattedTotal = useMemo(
    () =>
      mintInfo && voteWeight
        ? new BigNumber(voteWeight.toString())
            .shiftedBy(-mintInfo.decimals)
            .toString()
        : undefined,
    [mintInfo, voteWeight]
  )

  // TODO QV-2: isLoading should also use the usePlugins loading state
  if (isLoading || !voteWeight) {
    return (
      <div
        className={classNames(
          props.className,
          'rounded-md bg-bkg-1 h-[76px] animate-pulse'
        )}
      />
    )
  }

  return (
    <div className={clsx(props.className)}>
      <div className={'p-3 rounded-md bg-bkg-1'}>
        <div className="flex items-center justify-between mt-1">
          <div className=" flex flex-col gap-x-2">
            <div
              className={clsx(props.className, voteWeight.isZero() && 'hidden')}
            >
              <div className={'p-3 rounded-md bg-bkg-1'}>
                <div className="text-fgd-3 text-xs">QV Votes</div>
                <div className="flex items-center justify-between mt-1">
                  <div className=" flex flex-row gap-x-2">
                    <div className="text-xl font-bold text-fgd-1 hero-text">
                      {formattedTotal ?? 0}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xl font-bold text-fgd-1 hero-text">
              <TokenDeposit
                mint={mintInfo}
                tokenRole={GoverningTokenRole.Community}
                inAccountDetails={true}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
