import { BigNumber } from 'bignumber.js'
import { SecondaryButton } from '@components/Button'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import { useRealmQuery } from '@hooks/queries/realm'
import { useConnection } from '@solana/wallet-adapter-react'
import { useAsync } from 'react-async-hook'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import BN from 'bn.js'
import { fetchMintInfoByPubkey } from '@hooks/queries/mintInfo'
import { fetchTokenAccountByPubkey } from '@hooks/queries/tokenAccount'
import { useDepositCallback } from './useDepositCallback'
import { getMintMetadata } from '@components/instructions/programs/splToken'

export const Deposit = ({ role }: { role: 'community' | 'council' }) => {
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()
  const walletPk = wallet?.publicKey ?? undefined

  const { connection } = useConnection()

  const { result } = useAsync(async () => {
    if (realm === undefined || walletPk === undefined) return undefined
    const mint =
      role === 'community'
        ? realm.account.communityMint
        : realm.account.config.councilMint
    if (mint === undefined) return undefined

    const userAtaPk = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
      TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
      mint, // mint
      walletPk // owner
    )

    const { result: userAta } = await fetchTokenAccountByPubkey(
      connection,
      userAtaPk
    )
    const { result: mintInfo } = await fetchMintInfoByPubkey(connection, mint)
    return { mint, userAta, mintInfo } as const
  }, [connection, realm, role, walletPk])

  const depositAmount = result?.userAta?.amount
    ? new BigNumber(result.userAta.amount.toString())
    : new BigNumber(0)

  const tokenName =
    getMintMetadata(result?.mint)?.name ?? realm?.account.name ?? ''

  const deposit = useDepositCallback(role)

  return !depositAmount.isGreaterThan(0) ? null : (
    <>
      <div className="mt-3 text-xs text-white/50">
        You have{' '}
        {result?.mintInfo
          ? depositAmount.shiftedBy(-result.mintInfo.decimals).toFormat()
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
