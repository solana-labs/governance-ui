import { PublicKey } from '@solana/web3.js'
import { CivicProfile, Profile as BaseProfile } from '@civic/profile'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { useQuery } from '@tanstack/react-query'

type Profile = BaseProfile & {
  exists: boolean
}

const profileIsSet = (profile: BaseProfile): boolean =>
  !!profile.name || !!profile.image || !!profile.headline

export const useProfile = (
  publicKey?: PublicKey
): { profile: Profile | undefined; loading: boolean } => {
  const connection = useLegacyConnectionContext()
  const connectedWallet = useWalletOnePointOh()

  const profileWalletPublicKey = publicKey || connectedWallet?.publicKey
  const options = connection
    ? { solana: { connection: connection?.current } }
    : undefined

  const { data: profile, isLoading } = useQuery(
    ['Civic Profile', profileWalletPublicKey?.toBase58() + 'Civic'],
    // @ts-ignore we won't run this if there is no profileWalletPublicKey
    () => CivicProfile.get(profileWalletPublicKey?.toBase58(), options),
    {
      enabled: !!profileWalletPublicKey, // Only run query if profileWalletPublicKey is available
      select: (data) => ({
        ...data,
        exists: profileIsSet(data),
      }),
    }
  )

  return { profile, loading: isLoading }
}
