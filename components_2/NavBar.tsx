import { useEffect, useState } from 'react'
import Button, { AltButton } from './Button'

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
      <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4">
        <div className="flex items-center space-x-1">
          <img src="1-Landing-v2/logo-realms-blue.png" className="w-8 h-8" />
          <span>Realms</span>
        </div>
        <div className="flex items-center space-x-7">
          <div className="invisible md:visible">
            <AltButton tertiary>
              <div className="relative flex items-center justify-center">
                <div className="pl-4 pr-2 py-1">Read the Docs</div>
                <img
                  src="/1-Landing-v2/icon-external-link-white.png"
                  className="w-3 h-3 mr-4"
                  alt="External link icon"
                />
              </div>
            </AltButton>
          </div>
          <AltButton secondary>
            <div className="relative flex items-center justify-center">
              <div className="bg-[#201F27] hover:bg-[#292833] rounded-full ml-2 mr-4">
                <img
                  src="/1-Landing-v2/icon-binoculars-blue.png"
                  className="w-8 h-8 p-1"
                  alt="Binoculars"
                />
              </div>
              <div className="pr-8">Explore DAOs</div>
            </div>
          </AltButton>
        </div>
      </div>
    </div>
  )
}
