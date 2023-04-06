import { AnchorProvider, BN, Idl, Program } from '@coral-xyz/anchor'
import { PublicKey } from '@solana/web3.js'
import useSerumGovStore, { UserAccountType } from 'stores/useSerumGovStore'
import useSWR from 'swr'
import useWalletDeprecated from './useWalletDeprecated'
import IDL from '../idls/serum_gov.json'

const fetchUserAccount = async (
  anchorProvider: AnchorProvider,
  serumGovProgramId: PublicKey,
  ownerAddress?: string | PublicKey | null
): Promise<UserAccountType> => {
  if (!ownerAddress) throw new Error('No ownerAddress provided')

  const owner =
    typeof ownerAddress === 'string'
      ? new PublicKey(ownerAddress)
      : ownerAddress

  const program = new Program(IDL as Idl, serumGovProgramId, anchorProvider)

  const [account] = PublicKey.findProgramAddressSync(
    [Buffer.from('user'), owner.toBuffer()],
    serumGovProgramId
  )

  const userAccount = await program.account.user.fetch(account)
  return {
    address: account,
    owner: owner,
    lockIndex: (userAccount.lockIndex as BN).toNumber(),
    vestIndex: (userAccount.vestIndex as BN).toNumber(),
  }
}

export default function useSerumGovUser(owner?: PublicKey | string | null) {
  const { anchorProvider } = useWalletDeprecated()
  const serumGovProgramId = useSerumGovStore((s) => s.programId)

  const { data, error, mutate, isValidating } = useSWR(
    () =>
      owner && [
        owner.toString(),
        serumGovProgramId.toBase58(),
        anchorProvider.connection.rpcEndpoint,
        'user_account',
      ],
    () => fetchUserAccount(anchorProvider, serumGovProgramId, owner)
  )

  const loading = !data && !error

  return {
    userAccount: data,
    loading,
    error,
    mutate,
    isValidating,
  }
}
