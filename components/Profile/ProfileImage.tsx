import React, { FC } from 'react'
import { useProfile } from '@components/Profile/useProfile'
import ImgWithLoader from '@components/ImgWithLoader'
import { PublicKey } from '@solana/web3.js'
import { LoadingDots } from '@components/Loading'
import classNames from 'classnames'
import { UserCircleIcon } from '@heroicons/react/solid'

/**
 * A component that shows the user's profile image from whatever source their
 * profile is set to.
 */
type Props = { publicKey?: PublicKey; expanded?: boolean; className?: string }
export const ProfileImage: FC<Props> = ({ publicKey, expanded, className }) => {
  const commonClasses = 'rounded-full border-fgd-4 border'
  const profilePopupClasses = [
    'flex justify-center ml-2',
    expanded ? 'w-24 h-24 md:w-40 md:h-40' : 'w-8 h-8 md:w-10 md:h-10',
  ]
  const classes = classNames(commonClasses, className || profilePopupClasses)

  const { profile, loading } = useProfile(publicKey)

  // Profile loading - show loading dots
  if (!profile && loading) return <LoadingDots />

  // No civic profile - show placeholder
  if (!profile || !profile.image) {
    return<a
        className="underline"
        target="_blank"
        href={'https://civic.me/' + publicKey?.toString()}
        rel="noreferrer"
    >
      <UserCircleIcon className={classes}/>
    </a>
  }

  // Show civic profile image with loader as image loads
  return (
      <a
          className="underline"
          target="_blank"
          href={'https://civic.me/' + publicKey?.toString()}
          rel="noreferrer"
      >
        <ImgWithLoader
            src={profile.image.url}
            className={classes}
            alt="Profile pic"
        />
      </a>
  )
}
