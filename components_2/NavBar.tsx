import Link from 'next/link'
import { ExploreButton, ReadTheDocsButton } from 'pages/solana'
import { useEffect, useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'

export const NavContent = ({ showWalletButton }) => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between">
      <Link href="/solana">
        <div className="flex items-center space-x-1 cursor-pointer hover:brightness-110">
          <img src="/1-Landing-v2/logo-realms-blue.png" className="w-8 h-8" />
          <span>Realms</span>
        </div>
      </Link>
      {showWalletButton ? (
        <ConnectWalletButton />
      ) : (
        <div className="flex items-center space-x-7">
          <div className="hidden md:block">
            <ReadTheDocsButton />
          </div>
          <ExploreButton />
        </div>
      )}
    </div>
  )
}

export const Navbar = ({ showWalletButton }) => {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    // just trigger this so that the initial state
    // is updated as soon as the component is mounted
    // related: https://stackoverflow.com/a/63408216
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      className={`fixed w-full top-0 z-10 pt-5 pb-5 transition-all duration-300 ${
        scrollY > 200 ? 'bg-[#292833] bg-opacity-90 backdrop-blur-[3px]' : ''
      }`}
    >
      <NavContent showWalletButton={showWalletButton} />
    </div>
  )
}

export default Navbar
