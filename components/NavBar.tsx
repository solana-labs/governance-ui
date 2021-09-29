import { useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  const [showAltText, setShowAltText] = useState(false)

  const onLogoError = (e: any) => {
    // Hide broken image and show the realm name instead
    e.target.style.display = 'none'
    setShowAltText(true)
  }

  return (
    <div className="bg-bkg-1 flex h-20 items-center justify-between px-6">
      <div className="flex justify-start lg:w-0 lg:flex-1">
        <a href={'/'}>
          <>
            <span className="sr-only">{'Solana'}</span>
            <img
              className="h-7"
              src="img/solanaLogo.svg"
              alt={'Solana'}
              width="auto"
              onError={onLogoError}
            />
            {showAltText && <span>Solana</span>}
          </>
        </a>
      </div>
      <ConnectWalletButton />
    </div>
  )
}

export default NavBar
