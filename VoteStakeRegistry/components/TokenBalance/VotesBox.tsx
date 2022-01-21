import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { fmtMintAmount } from '@tools/sdk/units'

const VotesBox = ({
  votingPower,
  mint,
  votingPowerFromDeposits,
  className = '',
}: {
  votingPower: BN
  mint: MintInfo
  votingPowerFromDeposits: BN
  className?: string
}) => {
  const votingPowerFmt =
    votingPower && mint ? fmtMintAmount(mint, votingPower) : '0'

  return (
    <div className={`bg-bkg-1 rounded-md ${className}`}>
      <p className="text-fgd-3 text-xs">Votes</p>
      <h3 className="mb-0 py-2 flex items-center">
        {votingPowerFmt}{' '}
        {!votingPowerFromDeposits.isZero() && !votingPower.isZero() && (
          <div className="text-xs ml-2 font-light rounded-full bg-bkg-3 px-2 py-1">
            {`${(
              votingPower.toNumber() / votingPowerFromDeposits.toNumber()
            ).toFixed(2)}x`}
          </div>
        )}
      </h3>
    </div>
  )
}

export default VotesBox
