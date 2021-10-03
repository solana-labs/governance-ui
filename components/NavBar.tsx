// import { useState } from 'react'
import { UserGroupIcon } from '@heroicons/react/solid'
import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  // const [showAltText, setShowAltText] = useState(false)

  // const onLogoError = (e: any) => {
  //   // Hide broken image and show the realm name instead
  //   e.target.style.display = 'none'
  //   setShowAltText(true)
  // }

  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-1 col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-between px-4">
        <a href={'/'}>
          <>
            <span className="sr-only">{'Solana'}</span>
            <UserGroupIcon className="h-8 w-8 text-fgd-1" />
            {/* <img
              className="h-7"
              src="/img/solanaLogo.svg"
              alt={'Solana'}
              width="auto"
              onError={onLogoError}
            />
            {showAltText && <span>Solana</span>} */}
          </>
        </a>
        <ConnectWalletButton />
      </div>
    </div>
  )
}

export default NavBar
