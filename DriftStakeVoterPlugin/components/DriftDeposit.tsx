import { BigNumber } from 'bignumber.js'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import useUserGovTokenAccountQuery from '@hooks/useUserGovTokenAccount'
import { DepositTokensButton } from '@components/DepositTokensButton'
import Button from '@components/Button'
import { DRIFT_GOVERNANCE_TICKER } from 'DriftStakeVoterPlugin/constants'

/** Contextual deposit, shows only if relevant */
export const DriftDeposit = ({ role }: { role: 'community' | 'council' }) => {
  const realm = useRealmQuery().data?.result
  const mint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint

  const mintInfo = useMintInfoByPubkeyQuery(mint).data?.result
  const userAta = useUserGovTokenAccountQuery(role).data?.result

  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0)

  return !depositAmount.isGreaterThan(0) ? null : (
    <>
      <div className="mt-3 text-xs text-white/50">
        You have{' '}
        {mintInfo
          ? depositAmount.shiftedBy(-mintInfo.decimals).toFormat()
          : depositAmount.toFormat()}{' '}
        more {DRIFT_GOVERNANCE_TICKER} in your wallet. You can stake it with
        Drift or deposit it into Realms to increase your voting power.
      </div>
      <div className="mt-3 flex flex-row justify-start flex-wrap gap-2 max-w-full">
        <Button
          onClick={
            // navigate to https://app.drift.trade/earn/stake in new tab
            () => window.open('https://app.drift.trade/earn/stake', '_blank')
          }
          style={{
            flex: '1 1 60px',
            color: 'rgba(3, 10, 19, 1)',
            backgroundImage:
              'linear-gradient(114.67deg, hsla(0, 0%, 100%, .2) 16.59%, transparent 56.74%), linear-gradient(137.87deg, #f6f063 0, hsla(2, 64%, 67%, 0) 30%), linear-gradient(83.36deg, #ff3873 3.72%, #9162f6 46.75%, #3fe5ff 94.51%)',
          }}
        >
          <span className="whitespace-nowrap">Stake with Drift</span>
        </Button>
        <DepositTokensButton
          role={role}
          as="secondary"
          style={{ flex: '1 1 40px' }}
        />
      </div>
    </>
  )
}
