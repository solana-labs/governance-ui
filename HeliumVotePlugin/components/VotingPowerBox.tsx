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
  const votingPowerFmt =
    votingPower && mint
      ? getMintDecimalAmount(mint, votingPower).toFormat(2)
      : '0'

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
            {votingPowerFmt}{' '}
            {!votingPowerFromDeposits.isZero() && !votingPower.isZero() && (
              <Tooltip content="Vote Weight Multiplier – Increase your vote weight by locking tokens">
                <div className="cursor-help flex font-normal items-center text-xs ml-3 rounded-full bg-bkg-3 px-2 py-1">
                  <LightningBoltIcon className="h-3 mr-1 text-primary-light w-3" />
                  {`${votingPower
                    .div(votingPowerFromDeposits)
                    .toNumber()
                    .toFixed(2)}x`}
                </div>
              </Tooltip>
            )}
          </span>
        </div>
        <div>
          {Number(votingPowerFmt) > 0
            ? max &&
              !max.isZero() && (
                <VotingPowerPct
                  amount={new BigNumber(votingPowerFmt)}
                  total={max}
                />
              )
            : null}
        </div>
      </div>
    </>
  )
}
