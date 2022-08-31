import { useEffect, useState } from 'react'
import { Connection, PublicKey } from '@solana/web3.js'
import { CivicProfile, Profile } from '@civic/profile'
import useWalletStore from 'stores/useWalletStore'

const getProfile = async (
  publicKey: PublicKey,
  connection?: Connection
): Promise<Profile> =>
  CivicProfile.get(publicKey.toBase58(), {
    solana: {
      connection,
    },
  })

export const useProfile = (
  publicKey?: PublicKey
): { profile: Profile | undefined; loading: boolean } => {
  const connection = useWalletStore((s) => s.connection)
  const connectedWallet = useWalletStore((s) => s.current)
  const [profile, setProfile] = useState<Profile>()
  const [loading, setLoading] = useState(true)

  const profileWalletPublicKey = publicKey || connectedWallet?.publicKey

  useEffect(() => {
    if (profileWalletPublicKey) {
      getProfile(profileWalletPublicKey, connection?.current).then(
        (profile) => {
          setProfile(profile)
          setLoading(false)
        }
      )
    }
  }, [publicKey, connectedWallet?.publicKey, connection.current])

  return { profile, loading }
}
