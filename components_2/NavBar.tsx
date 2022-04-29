import { ExploreButton, ReadTheDocsButton } from 'pages/solana'
import { useEffect, useState } from 'react'
import Button from './Button'

const NavBar = () => {
  return (
    <div className="bg-[#0B121B] bg-opacity-90 px-24 py-8 sticky top-0 z-50">
      <div className="flex items-center">
        <div>
          <img src="/img/realms-web/icons/Realms-logo.svg" className="mr-2" />
        </div>
        <div className="flex-1">
          <a rel="noreferrer" href="" target="_blank">
            Realms
          </a>
        </div>
        <div className="ml-auto">
          <Button className="">Create DAO</Button>
        </div>
      </div>
    </div>
  )
}

export default NavBar

export const NavContent = () => {
  return (
    <div className="max-w-[1440px] mx-auto px-4 flex items-center justify-between">
      <div className="flex items-center space-x-1">
        <img src="1-Landing-v2/logo-realms-blue.png" className="w-8 h-8" />
        <span>Realms</span>
      </div>
      <div className="flex items-center space-x-7">
        <div className="hidden md:block">
          <ReadTheDocsButton />
        </div>
        <ExploreButton />
      </div>
    </div>
  )
}

export const AltNavbar = () => {
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
      <NavContent />
    </div>
  )
}
