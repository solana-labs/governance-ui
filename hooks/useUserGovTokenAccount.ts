import { useAsync } from 'react-async-hook'
import { useRealmQuery } from './queries/realm'
import useWalletOnePointOh from './useWalletOnePointOh'
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  Token,
} from '@solana/spl-token'
import { useTokenAccountByPubkeyQuery } from './queries/tokenAccount'

const useUserGovTokenAccountQuery = (role: 'community' | 'council') => {
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
        walletPk,
        true
      ),
    [mint, walletPk]
  )
  return useTokenAccountByPubkeyQuery(userAtaPk)
}
export default useUserGovTokenAccountQuery
