import { BigNumber } from 'bignumber.js'
import { SecondaryButton } from '@components/Button'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useAsync } from 'react-async-hook'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import BN from 'bn.js'
import { useMintInfoByPubkeyQuery } from '@hooks/queries/mintInfo'
import { useTokenAccountByPubkeyQuery } from '@hooks/queries/tokenAccount'
import { useDepositCallback } from './useDepositCallback'
import { getMintMetadata } from '@components/instructions/programs/splToken'

/** Contextual deposit, shows only if relevant */
export const Deposit = ({ role }: { role: 'community' | 'council' }) => {
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const walletPk = wallet?.publicKey ?? undefined
  const mint =
    role === 'community'
      ? realm?.account.communityMint
      : realm?.account.config.councilMint
  const { result: userAtaPk } = useAsync(
    async () =>
      walletPk &&
      mint &&
      Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        mint,
        walletPk
      ),
    [mint, walletPk]
  )
  const mintInfo = useMintInfoByPubkeyQuery(mint).data?.result
  const userAta = useTokenAccountByPubkeyQuery(userAtaPk).data?.result

  const depositAmount = userAta?.amount
    ? new BigNumber(userAta.amount.toString())
    : new BigNumber(0)

  const tokenName = getMintMetadata(mint)?.name ?? realm?.account.name ?? ''

  const deposit = useDepositCallback(role)

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
      <SecondaryButton
        className="mt-4 w-48"
        onClick={() => deposit(new BN(depositAmount.toString()))}
      >
        Deposit
      </SecondaryButton>
    </>
  )
}
