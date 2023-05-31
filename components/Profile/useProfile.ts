import { useEffect, useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { CivicProfile, Profile as BaseProfile } from '@civic/profile'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'

type Profile = BaseProfile & {
  exists: boolean
}

const getProfile = async (
  publicKey: PublicKey,
  connection?: Connection
): Promise<BaseProfile> =>
  CivicProfile.get(publicKey.toBase58(), {
    solana: {
      connection,
    },
  })

const profileIsSet = (profile: BaseProfile): boolean =>
  !!profile.name || !!profile.image || !!profile.headline

export const useProfile = (
  publicKey?: PublicKey
): { profile: Profile | undefined; loading: boolean } => {
  const connection = useLegacyConnectionContext()
  const connectedWallet = useWalletOnePointOh()
  const [profile, setProfile] = useState<Profile>()
  const [loading, setLoading] = useState(true)

  const profileWalletPublicKey = publicKey || connectedWallet?.publicKey

  useEffect(() => {
    if (profileWalletPublicKey) {
      getProfile(profileWalletPublicKey, connection?.current).then(
        (profile) => {
          setProfile({
            ...profile,
            exists: profileIsSet(profile),
          })
          setLoading(false)
        }
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [publicKey, connectedWallet?.publicKey, connection.current])

  return { profile, loading }
}
