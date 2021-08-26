import { useEffect, useState } from 'react'
import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)

  const toggleMobileMenu = (e) => {
    setMobileMenuVisible(!mobileMenuVisible)
    e.stopPropagation()
  }

  const closeMenu = () => {
    setMobileMenuVisible(false)
  }

  useEffect(() => {
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  })

  return (
    <div className="border-b border-bkg-2 px-6 py-4 bg-bkg-2">
      <div className="flex justify-between items-center md:justify-start md:space-x-10">
        <div className="flex justify-start lg:w-0 lg:flex-1">
          <a href="https://mango.markets">
            <span className="sr-only">Mango</span>
            <img className="h-7" src="img/logo_mango.svg" alt="" width="auto" />
          </a>
        </div>
        <div className="-mr-2 -my-2 md:hidden">
          <button
            type="button"
            className=" rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <span className="sr-only">Open menu</span>
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>
        <ConnectWalletButton />
      </div>
    </div>
  )
}

export default NavBar
