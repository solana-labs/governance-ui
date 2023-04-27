import React from 'react'
import BigNumber from 'bignumber.js'
import { BN } from '@coral-xyz/anchor'
import { MintInfo } from '@solana/spl-token'
import { getMintDecimalAmount } from '@tools/sdk/units'
import { LightningBoltIcon } from '@heroicons/react/solid'
import Tooltip from '@components/Tooltip'
import VotingPowerPct from '@components/ProposalVotingPower/VotingPowerPct'

export interface VotingPowerBoxProps {
  votingPower: BN
  mint: MintInfo
  votingPowerFromDeposits: BN
  className?: string
  style?: any
}

export const VotingPowerBox: React.FC<VotingPowerBoxProps> = ({
  votingPower,
  mint,
  votingPowerFromDeposits,
  className = '',
  style,
}) => {
  const votingPowerBigNum =
    votingPower && mint
      ? getMintDecimalAmount(mint, votingPower)
      : new BigNumber(0)

  const votingPowerFromDepositsBigNum =
    votingPowerFromDeposits && mint
      ? getMintDecimalAmount(mint, votingPowerFromDeposits)
      : new BigNumber(0)

  const max: BigNumber = new BigNumber(mint.supply.toString())

  return (
    <>
      {' '}
      <div
        className={`bg-bkg-1 flex justify-between items-center rounded-md ${className}`}
        style={style}
      >
        <div>
          <p className="text-fgd-3">Votes</p>
          <span className="mb-0 flex font-bold items-center hero-text">
            {votingPowerBigNum.toFormat(2)}{' '}
            {!votingPowerFromDeposits.isZero() && !votingPower.isZero() && (
              <Tooltip content="Vote Weight Multiplier – Increase your vote weight by locking tokens">
                <div className="cursor-help flex font-normal items-center text-xs ml-3 rounded-full bg-bkg-3 px-2 py-1">
                  <LightningBoltIcon className="h-3 mr-1 text-primary-light w-3" />
                  {`${votingPowerBigNum
                    .div(votingPowerFromDepositsBigNum)
                    .toFixed(2)}x`}
                </div>
              </Tooltip>
            )}
          </span>
        </div>
        <div>
          {votingPowerBigNum.gt(0)
            ? max &&
              !max.isZero() && (
                <VotingPowerPct amount={votingPowerBigNum} total={max} />
              )
            : null}
        </div>
      </div>
    </>
  )
}
