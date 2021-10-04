//import { useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'
import useRealm from '../hooks/useRealm'
//import { getResourcePathPart } from '../tools/core/resources'
import { UserGroupIcon } from '@heroicons/react/solid'

const NavBar = () => {
  const { realm, realmInfo } = useRealm()
  //const [showAltText, setShowAltText] = useState(false)
  const { DAO } = process.env

  const realmName = DAO ? realmInfo?.mainnetName ?? realm?.info.name : 'Solana'
  //   const onLogoError = (e: any) => {
  // Hide broken image and show the realm name instead
  //     e.target.style.display = 'none'
  //     setShowAltText(true)
  //   }

  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-1 col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-between px-4">
        <a href={DAO && realmInfo?.website ? `${realmInfo?.website}` : '/'}>
          {realmName && (
            <>
              <span className="sr-only">{realmName}</span>
              <UserGroupIcon className="h-8 w-8 text-fgd-1" />
              {/* <img
                className="h-7"
                src={`/realms/${getResourcePathPart(realmName)}/img/logo.svg`}
                alt={realmName}
                width="auto"
                onError={onLogoError}
              />
              {showAltText && <span> {realmName}</span>} */}
            </>
          )}
        </a>
        <ConnectWalletButton />
      </div>
    </div>
  )
}

export default NavBar
