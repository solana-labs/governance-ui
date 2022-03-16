import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { fmtMintAmount } from '@tools/sdk/units'
import { LightningBoltIcon } from '@heroicons/react/solid'
import Tooltip from '@components/Tooltip'

const VotingPowerBox = ({
  votingPower,
  mint,
  votingPowerFromDeposits,
  className = '',
  style,
}: {
  votingPower: BN
  mint: MintInfo
  votingPowerFromDeposits: BN
  className?: string
  style?: any
}) => {
  const votingPowerFmt =
    votingPower && mint ? fmtMintAmount(mint, votingPower) : '0'

  return (
    <div className={`bg-bkg-1 rounded-md ${className}`} style={style}>
      <p className="text-fgd-3">Votes</p>
      <span className="mb-0 flex font-bold items-center hero-text">
        {parseFloat(votingPowerFmt).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}{' '}
        {!votingPowerFromDeposits.isZero() && !votingPower.isZero() && (
          <Tooltip content="Vote Weight Multiplier – Increase your vote weight by locking tokens">
            <div className="cursor-help flex font-normal items-center text-xs ml-3 rounded-full bg-bkg-3 px-2 py-1">
              <LightningBoltIcon className="h-3 mr-1 text-primary-light w-3" />
              {`${(
                votingPower.toNumber() / votingPowerFromDeposits.toNumber()
              ).toFixed(2)}x`}
            </div>
          </Tooltip>
        )}
      </span>
    </div>
  )
}

export default VotingPowerBox
