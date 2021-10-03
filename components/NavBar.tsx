import { useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'
import useRealm from '../hooks/useRealm'
import { getResourcePathPart } from '../tools/core/resources'

const NavBar = () => {
  const { realm, realmInfo } = useRealm()
  const [showAltText, setShowAltText] = useState(false)
  const { DAO } = process.env

  const realmName = DAO ? realmInfo?.mainnetName ?? realm?.info.name : 'Solana'
  const onLogoError = (e: any) => {
    // Hide broken image and show the realm name instead
    e.target.style.display = 'none'
    setShowAltText(true)
  }

  return (
    <div className="bg-bkg-1 flex h-20 items-center justify-between px-6">
      <div className="flex justify-start lg:w-0 lg:flex-1">
        <a href={DAO && realmInfo?.website ? `${realmInfo?.website}` : '/'}>
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
