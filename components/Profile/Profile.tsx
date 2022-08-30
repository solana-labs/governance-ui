import React, { FC } from 'react'
import { useProfile, ProfileImage } from '@components/Profile'
import { PublicKey } from '@solana/web3.js'
import { LoadingDots } from '@components/Loading'
import { CivicIcon } from '@components/icons'
import useWalletStore from '../../stores/useWalletStore'

const VisitLink: FC<{ address: PublicKey }> = ({ address }) => (
  <a
    className="underline"
    target="_blank"
    href={'https://civic.me/' + address}
    rel="noreferrer"
  >
    Visit on civic.me
  </a>
)

const ClaimLink: FC<{ address: PublicKey }> = ({ address }) => (
  <a
    className="underline"
    target="_blank"
    href={'https://civic.me/' + address}
    rel="noreferrer"
  >
    Claim your profile at civic.me
  </a>
)

type Props = { publicKey?: PublicKey; expanded?: boolean }
export const Profile: FC<Props> = ({ publicKey, expanded }) => {
  const connectedWallet = useWalletStore((s) => s.current)
  const { profile, loading } = useProfile(publicKey)

  if (!profile && loading) return <LoadingDots />
  if (!profile) return <div>No profile</div>

  const profileSet = profile?.name

  // The profile is for the current logged-in user, if no public key is passed, or if it matches the wallet
  const isLoggedInUser =
    !publicKey || connectedWallet?.publicKey?.equals(publicKey)
  const address = publicKey || connectedWallet?.publicKey

  if (!address) return <div>No address</div>

  if (expanded) {
    return (
      <div className="align-middle block items-center justify-center">
        <div className="flex items-center justify-center">
          <ProfileImage publicKey={publicKey} expanded={expanded} />
        </div>
        <div className="flex align-middle text-lg items-center justify-center">
          {profile.name ? profile.name.value : 'No name set'}
        </div>
        {!profileSet && isLoggedInUser && (
          <div className="text-lg text-fgd-3 mt-2">
            <ClaimLink address={address} />
          </div>
        )}
        {(profileSet || !isLoggedInUser) && (
          <div className="text-lg text-fgd-3 mt-2">
            <VisitLink address={address} />
          </div>
        )}
      </div>
    )
  } else {
    // small
    return (
      <div className="block">
        <div className="flex items-center justify-center">
          <CivicIcon className="h-4 w-4 fill-black mr-2" />
          <div className="align-middle text-sm">
            {profile.name ? profile.name.value : 'No name set'}
          </div>
          <ProfileImage publicKey={publicKey} expanded={expanded} />
        </div>
        {!profileSet && isLoggedInUser && (
          <div className="text-xs text-fgd-3 mt-2">
            <ClaimLink address={address} />
          </div>
        )}
      </div>
    )
  }
}
