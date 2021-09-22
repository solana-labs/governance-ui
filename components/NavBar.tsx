import { useState } from 'react'
import useRealm from '../hooks/useRealm'
import { getResourcePathPart } from '../tools/core/resources'
import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  const { realm, realmInfo } = useRealm()
  const [showAltText, setShowAltText] = useState(false)

  const onLogoError = (e: any) => {
    e.target.style.display = 'none'
    setShowAltText(true)
  }

  // TODO: Show solana/realms branding when on the home page
  const realmName = realmInfo?.mainnetName ?? realm?.info.name

  return (
    <div className="bg-bkg-1 flex h-20 items-center justify-between px-6">
      <div className="flex justify-start lg:w-0 lg:flex-1">
        <a href={realmInfo?.website ? `${realmInfo?.website}` : ''}>
          {realmName && (
            <>
              <span className="sr-only">{realmName}</span>
              <img
                className="h-7"
                src={`/realms/${getResourcePathPart(realmName)}/img/logo.svg`}
                alt={realmName}
                width="auto"
                onError={onLogoError}
              />
              {showAltText && <span> {realmName}</span>}
            </>
          )}
        </a>
      </div>
      <ConnectWalletButton />
    </div>
  )
}

export default NavBar
