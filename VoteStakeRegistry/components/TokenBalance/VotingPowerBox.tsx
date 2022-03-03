import { BN } from '@project-serum/anchor'
import { MintInfo } from '@solana/spl-token'
import { fmtMintAmount } from '@tools/sdk/units'

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
    <div className={`bg-bkg-1 ${className}`} style={style}>
      <p className="text-fgd-3 text-xs">Votes</p>
      <h3 className="mb-0 flex items-center">
        {votingPowerFmt}{' '}
        {!votingPowerFromDeposits.isZero() && !votingPower.isZero() && (
          <div className="text-xs ml-3 font-light bg-bkg-3 px-2 py-1">
            {`${(
              votingPower.toNumber() / votingPowerFromDeposits.toNumber()
            ).toFixed(2)}x`}
          </div>
        )}
      </h3>
    </div>
  )
}

export default VotingPowerBox
