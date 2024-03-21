import { BigNumber } from 'bignumber.js'
import { useRealmQuery } from '@hooks/queries/realm'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { getMintMetadata } from '@components/instructions/programs/splToken'
import useUserGovTokenAccountQuery from '@hooks/useUserGovTokenAccount'
import { DepositTokensButton } from '@components/DepositTokensButton'

/** Contextual deposit, shows only if relevant */
export const Deposit = ({ role }: { role: 'community' | 'council' }) => {
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

  const tokenName = getMintMetadata(mint)?.name ?? realm?.account.name ?? ''

  return !depositAmount.isGreaterThan(0) ? null : (
    <>
      <div className="mt-3 text-xs text-white/50">
        You have{' '}
        {mintInfo
          ? depositAmount.shiftedBy(-mintInfo.decimals).toFormat()
          : depositAmount.toFormat()}{' '}
        more {tokenName} votes in your wallet. Do you want to deposit them to
        increase your voting power in this Dao?
      </div>
      <DepositTokensButton className="mt-4 w-48" role={role} as="secondary" />
    </>
  )
}
