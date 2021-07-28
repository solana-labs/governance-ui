import { useEffect, useState } from 'react'
import MangoPill from '../components/MangoPill'
// import Button from './Button'

const NavBarBeta = () => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)
  const [productMenuVisible, setProductMenuVisible] = useState(false)
  const [supportMenuVisible, setSupportMenuVisible] = useState(false)

  const toggleMobileMenu = (e) => {
    setMobileMenuVisible(!mobileMenuVisible)
    e.stopPropagation()
  }

  const toggleProducts = (e) => {
    setProductMenuVisible(!productMenuVisible)
    setSupportMenuVisible(false)
    e.stopPropagation()
  }

  const toggleSupport = (e) => {
    setSupportMenuVisible(!supportMenuVisible)
    setProductMenuVisible(false)
    e.stopPropagation()
  }

  const closeMenu = () => {
    setMobileMenuVisible(false)
    setProductMenuVisible(false)
    setSupportMenuVisible(false)
  }

  const doNothing = (e) => {
    e.stopPropagation()
  }

  useEffect(() => {
    window.addEventListener('click', closeMenu)
    return () => window.removeEventListener('click', closeMenu)
  })

  return (
    <div className="">
      {/* Main Menu */}
      <div className=" px-6 py-1 lg:px-10 lg:py-8 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-6 md:justify-start md:space-x-10">
            <div className="flex justify-start lg:w-0 lg:flex-1">
              <a href="https://mango.markets">
                <span className="sr-only">Mango</span>
                <img
                  className="h-8"
                  src="img/logo_mango.svg"
                  alt=""
                  width="auto"
                />
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
            <nav className="hidden md:flex space-x-10">
              <div className="relative">
                <button
                  type="button"
                  className="text-gray-500 group rounded-md p-1 px-2 inline-flex items-center text-base font-medium hover:bg-bkg-3 hover:text-white focus:outline-none "
                  onClick={toggleProducts}
                >
                  <span>Products</span>

                  <svg
                    className="text-gray-400 ml-2 h-5 w-5 group-hover:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div
                  className={`${
                    !productMenuVisible && 'hidden'
                  } absolute z-50 -ml-4 mt-3 transform px-2 w-screen max-w-md sm:px-0 lg:ml-0 lg:left-1/2 lg:-translate-x-1/2`}
                >
                  <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="relative grid gap-6 bg-bkg-2 px-5 py-6 sm:gap-8 sm:p-8">
                      <h3 className="text-sm tracking-wide font-medium text-yellow-300 uppercase">
                        Trading
                      </h3>
                      <a
                        href="https://trade.mango.markets/"
                        className="-m-3 p-3 flex items-start rounded-lg hover:bg-bkg-3"
                      >
                        <svg
                          className="flex-shrink-0 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 22 22"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M6 12V15M10 12V15M14 12V15M1 19H19M1 8H19M1 5L10 1L19 5M2 8H18V19H2V8Z"
                            stroke="#4F4C67"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <div className="ml-4">
                          <p className="text-base font-medium text-white">
                            Spot Markets
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Trade BTC, ETH, SOL, and SRM, cross collateralized
                            with up to 5x leverage.
                          </p>
                        </div>
                      </a>

                      <a
                        href="#"
                        onClick={doNothing}
                        className="disabled -m-3 p-3 flex items-start rounded-lg opacity-50"
                      >
                        <svg
                          className="flex-shrink-0 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 22 22"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M19 10C19 14.9706 14.9706 19 10 19M19 10C19 5.02944 14.9706 1 10 1M19 10H1M10 19C5.02944 19 1 14.9706 1 10M10 19C11.6569 19 13 14.9706 13 10C13 5.02944 11.6569 1 10 1M10 19C8.34315 19 7 14.9706 7 10C7 5.02944 8.34315 1 10 1M1 10C1 5.02944 5.02944 1 10 1"
                            stroke="#4F4C67"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <div className="ml-4">
                          <div className="text-base font-medium text-white">
                            Perpetual Futures <MangoPill />
                          </div>
                          <p className="mt-1 text-sm text-gray-500">
                            Cross-collateralized decentralized leveraged
                            perpetual futures markets.
                          </p>
                        </div>
                      </a>
                      <a
                        href="https://trade.mango.markets/borrow"
                        className="-m-3 p-3 flex items-start rounded-lg hover:bg-bkg-3"
                      >
                        <svg
                          className="flex-shrink-0 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 22 22"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M15 5V3C15 1.89543 14.1046 1 13 1H3C1.89543 1 1 1.89543 1 3V9C1 10.1046 1.89543 11 3 11H5M7 15H17C18.1046 15 19 14.1046 19 13V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V13C5 14.1046 5.89543 15 7 15ZM14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z"
                            stroke="#4F4C67"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <div className="ml-4">
                          <p className="text-base font-medium text-white">
                            Decentralized Lending
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Earn interest on deposits and take out
                            collateralized loans against assets
                          </p>
                        </div>
                      </a>
                      <h3 className="text-sm tracking-wide font-medium text-yellow-300 uppercase">
                        Infrastructure
                      </h3>
                      <a
                        href="https://gitlab.com/OpinionatedGeek/mango-explorer/-/blob/master/Quickstart.md"
                        className="-m-3 p-3 flex items-start rounded-lg hover:bg-bkg-3"
                      >
                        <svg
                          className="flex-shrink-0 h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 22 22"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            d="M16 17H21V15C21 13.3431 19.6569 12 18 12C17.0444 12 16.1931 12.4468 15.6438 13.1429M16 17H6M16 17V15C16 14.3438 15.8736 13.717 15.6438 13.1429M6 17H1V15C1 13.3431 2.34315 12 4 12C4.95561 12 5.80686 12.4468 6.35625 13.1429M6 17V15C6 14.3438 6.12642 13.717 6.35625 13.1429M6.35625 13.1429C7.0935 11.301 8.89482 10 11 10C13.1052 10 14.9065 11.301 15.6438 13.1429M14 4C14 5.65685 12.6569 7 11 7C9.34315 7 8 5.65685 8 4C8 2.34315 9.34315 1 11 1C12.6569 1 14 2.34315 14 4ZM20 7C20 8.10457 19.1046 9 18 9C16.8954 9 16 8.10457 16 7C16 5.89543 16.8954 5 18 5C19.1046 5 20 5.89543 20 7ZM6 7C6 8.10457 5.10457 9 4 9C2.89543 9 2 8.10457 2 7C2 5.89543 2.89543 5 4 5C5.10457 5 6 5.89543 6 7Z"
                            stroke="#4F4C67"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="ml-4">
                          <p className="text-base font-medium text-white">
                            Liquidator Program
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Help safegaurd the mango protocol, become a
                            decentralized liquidator.
                          </p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://docs.mango.markets/"
                className="text-base font-medium text-gray-500 p-1 px-2 hover:bg-bkg-3 hover:text-white focus:outline-none rounded-md"
              >
                Docs
              </a>

              <div className="relative">
                <button
                  type="button"
                  className="text-gray-500 group rounded-md p-1 px-2 inline-flex items-center text-base font-medium hover:bg-bkg-3 hover:text-white focus:outline-none"
                  onClick={toggleSupport}
                >
                  <span>Support</span>

                  <svg
                    className="text-gray-400 ml-2 h-5 w-5 group-hover:text-gray-500"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>

                <div
                  className={`${
                    !supportMenuVisible && 'hidden'
                  } absolute z-50 left-1/2 transform -translate-x-1/2 mt-3 px-2 w-screen max-w-md sm:px-0`}
                >
                  <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
                    <div className="relative grid gap-6 bg-bkg-2 px-5 py-6 sm:gap-8 sm:p-8">
                      <h3 className="text-sm tracking-wide font-medium text-yellow-300 uppercase">
                        Social
                      </h3>
                      <a
                        href="https://discord.gg/67jySBhxrg"
                        className="-m-3 p-3 flex items-start rounded-lg hover:bg-bkg-3"
                      >
                        {/* Heroicon name: outline/support */}
                        <svg
                          width="35"
                          height="35"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M23.7187 1.67497C21.9061 0.89249 19.9681 0.323786 17.9421 0C17.6932 0.41511 17.4025 0.973432 17.2021 1.4176C15.0482 1.11872 12.9142 1.11872 10.8 1.4176C10.5996 0.973432 10.3023 0.41511 10.0513 0C8.02293 0.323786 6.08271 0.894565 4.27023 1.67912C0.614418 6.77668 -0.376613 11.7477 0.118903 16.648C2.54363 18.3188 4.89347 19.3337 7.20367 19.9979C7.77407 19.2736 8.2828 18.5036 8.72106 17.692C7.88639 17.3993 7.08696 17.0382 6.33156 16.6189C6.53197 16.482 6.72798 16.3387 6.91738 16.1914C11.5246 18.1797 16.5304 18.1797 21.0826 16.1914C21.2741 16.3387 21.4701 16.482 21.6683 16.6189C20.9107 17.0402 20.1091 17.4014 19.2744 17.6941C19.7127 18.5036 20.2192 19.2757 20.7918 20C23.1042 19.3358 25.4563 18.3209 27.881 16.648C28.4624 10.9672 26.8878 6.04193 23.7187 1.67497ZM9.34871 13.6343C7.96567 13.6343 6.83149 12.4429 6.83149 10.9922C6.83149 9.54132 7.94144 8.34791 9.34871 8.34791C10.756 8.34791 11.8901 9.53924 11.8659 10.9922C11.8682 12.4429 10.756 13.6343 9.34871 13.6343ZM18.6512 13.6343C17.2682 13.6343 16.1339 12.4429 16.1339 10.9922C16.1339 9.54132 17.2439 8.34791 18.6512 8.34791C20.0584 8.34791 21.1926 9.53924 21.1684 10.9922C21.1684 12.4429 20.0584 13.6343 18.6512 13.6343Z"
                            fill="#4F4C67"
                          />
                        </svg>

                        <div className="ml-4">
                          <p className="text-base font-medium text-white">
                            Discord
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Get all of your questions answered in our discrod or
                            contact us for developer support.
                          </p>
                        </div>
                      </a>

                      <a
                        href="https://twitter.com/mangomarkets"
                        className="-m-3 p-3 flex items-start rounded-lg hover:bg-bkg-3"
                      >
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 28 28"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M8.78874 23C5.55374 23 2.53817 22.0591 0 20.4356C2.15499 20.5751 5.95807 20.2411 8.32358 17.9848C4.76508 17.8215 3.16026 15.0923 2.95094 13.926C3.25329 14.0426 4.6953 14.1826 5.50934 13.856C1.4159 12.8296 0.787928 9.23732 0.927477 8.14097C1.695 8.67749 2.99745 8.8641 3.50913 8.81744C-0.305207 6.08823 1.06703 1.98276 1.74151 1.09635C4.47882 4.88867 8.5812 7.01857 13.6564 7.13704C13.5607 6.71736 13.5102 6.28042 13.5102 5.83164C13.5102 2.61092 16.1134 0 19.3247 0C21.0025 0 22.5144 0.712754 23.5757 1.85284C24.6969 1.59011 26.3843 0.975068 27.2092 0.443205C26.7934 1.93611 25.4989 3.18149 24.7159 3.64308C24.7224 3.65878 24.7095 3.62731 24.7159 3.64308C25.4037 3.53904 27.2648 3.18137 28 2.68256C27.6364 3.52125 26.264 4.91573 25.1377 5.69642C25.3473 14.9381 18.2765 23 8.78874 23Z"
                            fill="#4F4C67"
                          />
                        </svg>
                        <div className="ml-4">
                          <p className="text-base font-medium text-white">
                            Twitter
                          </p>
                          <p className="mt-1 text-sm text-gray-500">
                            Quickly see what we&apos;re up to and meme with us.
                          </p>
                        </div>
                      </a>
                    </div>
                    <div className="px-5 py-5 bg-bkg-3 sm:px-8 sm:py-8">
                      <div>
                        <h3 className="text-sm tracking-wide font-bold text-yellow-300 uppercase">
                          Mango Guides
                        </h3>
                        <ul className="mt-4 space-y-4">
                          <li className="text-base truncate">
                            <a
                              href="https://docs.mango.markets/tutorials/transfer-funds-to-sollet-wallet"
                              className="font-medium text-white hover:text-gray-400"
                            >
                              Setting up a wallet
                            </a>
                          </li>

                          <li className="text-base truncate">
                            <a
                              href="https://docs.mango.markets/tutorials/trade-on-mango.markets"
                              className="font-medium text-white hover:text-gray-400"
                            >
                              Getting started with Mango Markets
                            </a>
                          </li>
                        </ul>
                      </div>
                      <div className="mt-5 text-sm">
                        <a
                          href="https://docs.mango.markets/margin-trading/overview"
                          className="font-bold text-transparent bg-clip-text bg-mango-yellow hover:bg-gradient-to-br from-mango-yellow via-mango-orange to-mango-green"
                        >
                          {' '}
                          Learn more about the Mango protocol{' '}
                          <span aria-hidden="true">&rarr;</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <a
                href="https://token.mango.markets"
                className="text-base font-medium text-gray-500 p-1 px-2 hover:bg-th-fgd-4 focus:outline-none rounded-md"
              >
                <div className="flex flex-row">
                  <p>Mango DAO</p>
                  <span style={{ width: '55px' }}></span>
                  {/* <MangoPill /> */}{' '}
                </div>
              </a>
            </nav>
            <div style={{ width: '310px' }} />
            {/* <div className="hidden md:flex items-center justify-end md:flex-1 lg:w-0">
              <div>
                <a rel="noreferrer" target="_blank" href="#">
                  <Button>Contribute now</Button>
                </a>
              </div>
            </div> */}
          </div>
        </div>

        {/* Mobile menu */}

        <div
          className={`${
            !mobileMenuVisible && 'hidden'
          } absolute top-1 inset-x-0 px-4 py-2 transition transform origin-top-right z-50`}
        >
          <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 bg-bkg-2">
            <div className="pt-5 pb-6 px-5">
              <div className="flex items-center justify-between">
                <div>
                  <img
                    className="h-8 ml-1"
                    src="img/logo_mango.svg"
                    alt=""
                    width="auto"
                  />
                </div>
                <div className="-mr-2">
                  <button
                    type="button"
                    className="bg-th-bkg-3 rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-th-bkg-4 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-yellow-300"
                    onClick={closeMenu}
                  >
                    <span className="sr-only">Close menu</span>
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <nav className="grid gap-y-8">
                  <a
                    href="https://trade.mango.markets"
                    className="-m-3 p-3 flex items-center rounded-md hover:bg-th-bkg-4"
                  >
                    <svg
                      className="flex-shrink-0 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 22 22"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M6 12V15M10 12V15M14 12V15M1 19H19M1 8H19M1 5L10 1L19 5M2 8H18V19H2V8Z"
                        stroke="#4F4C67"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-3 text-base font-medium text-white">
                      Spot Markets
                    </span>
                  </a>

                  <a
                    href="#"
                    onClick={doNothing}
                    className="disabled -m-3 p-3 flex items-center rounded-md hover:bg-th-bkg-4 opacity-50"
                  >
                    <svg
                      className="flex-shrink-0 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 22 22"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M19 10C19 14.9706 14.9706 19 10 19M19 10C19 5.02944 14.9706 1 10 1M19 10H1M10 19C5.02944 19 1 14.9706 1 10M10 19C11.6569 19 13 14.9706 13 10C13 5.02944 11.6569 1 10 1M10 19C8.34315 19 7 14.9706 7 10C7 5.02944 8.34315 1 10 1M1 10C1 5.02944 5.02944 1 10 1"
                        stroke="#4F4C67"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-3 text-base font-medium text-white">
                      Perpetual Futures <MangoPill />
                    </span>
                  </a>

                  <a
                    href="https://trade.mango.markets/borrow"
                    className="-m-3 p-3 flex items-center rounded-md hover:bg-th-bkg-4"
                  >
                    <svg
                      className="flex-shrink-0 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 22 22"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M15 5V3C15 1.89543 14.1046 1 13 1H3C1.89543 1 1 1.89543 1 3V9C1 10.1046 1.89543 11 3 11H5M7 15H17C18.1046 15 19 14.1046 19 13V7C19 5.89543 18.1046 5 17 5H7C5.89543 5 5 5.89543 5 7V13C5 14.1046 5.89543 15 7 15ZM14 10C14 11.1046 13.1046 12 12 12C10.8954 12 10 11.1046 10 10C10 8.89543 10.8954 8 12 8C13.1046 8 14 8.89543 14 10Z"
                        stroke="#4F4C67"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-3 text-base font-medium text-white">
                      Decentralized Lending
                    </span>
                  </a>

                  <a
                    href="https://gitlab.com/OpinionatedGeek/mango-explorer/-/blob/master/Quickstart.md"
                    className="-m-3 p-3 flex items-center rounded-md hover:bg-th-bkg-4"
                  >
                    <svg
                      className="flex-shrink-0 h-6 w-6"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 22 22"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        d="M16 17H21V15C21 13.3431 19.6569 12 18 12C17.0444 12 16.1931 12.4468 15.6438 13.1429M16 17H6M16 17V15C16 14.3438 15.8736 13.717 15.6438 13.1429M6 17H1V15C1 13.3431 2.34315 12 4 12C4.95561 12 5.80686 12.4468 6.35625 13.1429M6 17V15C6 14.3438 6.12642 13.717 6.35625 13.1429M6.35625 13.1429C7.0935 11.301 8.89482 10 11 10C13.1052 10 14.9065 11.301 15.6438 13.1429M14 4C14 5.65685 12.6569 7 11 7C9.34315 7 8 5.65685 8 4C8 2.34315 9.34315 1 11 1C12.6569 1 14 2.34315 14 4ZM20 7C20 8.10457 19.1046 9 18 9C16.8954 9 16 8.10457 16 7C16 5.89543 16.8954 5 18 5C19.1046 5 20 5.89543 20 7ZM6 7C6 8.10457 5.10457 9 4 9C2.89543 9 2 8.10457 2 7C2 5.89543 2.89543 5 4 5C5.10457 5 6 5.89543 6 7Z"
                        stroke="#4F4C67"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="ml-3 text-base font-medium text-white">
                      Liquidator Program
                    </span>
                  </a>

                  <a
                    href="https://docs.mango.markets/"
                    className="text-base font-medium text-white hover:bg-th-bkg-4"
                  >
                    <div className="flex flex-row">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 0.804233C5.9428 0.289057 4.75516 0 3.5 0C2.24484 0 1.0572 0.289057 0 0.804233V10.8042C1.0572 10.2891 2.24484 10 3.5 10C5.1686 10 6.71789 10.5108 8 11.3847C9.28211 10.5108 10.8314 10 12.5 10C13.7552 10 14.9428 10.2891 16 10.8042V0.804233C14.9428 0.289057 13.7552 0 12.5 0C11.2448 0 10.0572 0.289057 9 0.804233V8C9 8.55228 8.55229 9 8 9C7.44772 9 7 8.55229 7 8V0.804233Z"
                          fill="#4F4C67"
                        />
                      </svg>
                      <p className="mx-3 -mt-1">Explore the docs</p>
                    </div>
                  </a>
                </nav>
              </div>
              <h3 className="py-5 text-sm tracking-wide font-medium text-yellow-300 uppercase">
                Contact Us
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                <a
                  href="https://discord.gg/pkyK2aZjrA"
                  className="text-base font-medium text-white hover:bg-th-bkg-4"
                >
                  <div className="flex flex-row">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M23.7187 1.67497C21.9061 0.89249 19.9681 0.323786 17.9421 0C17.6932 0.41511 17.4025 0.973432 17.2021 1.4176C15.0482 1.11872 12.9142 1.11872 10.8 1.4176C10.5996 0.973432 10.3023 0.41511 10.0513 0C8.02293 0.323786 6.08271 0.894565 4.27023 1.67912C0.614418 6.77668 -0.376613 11.7477 0.118903 16.648C2.54363 18.3188 4.89347 19.3337 7.20367 19.9979C7.77407 19.2736 8.2828 18.5036 8.72106 17.692C7.88639 17.3993 7.08696 17.0382 6.33156 16.6189C6.53197 16.482 6.72798 16.3387 6.91738 16.1914C11.5246 18.1797 16.5304 18.1797 21.0826 16.1914C21.2741 16.3387 21.4701 16.482 21.6683 16.6189C20.9107 17.0402 20.1091 17.4014 19.2744 17.6941C19.7127 18.5036 20.2192 19.2757 20.7918 20C23.1042 19.3358 25.4563 18.3209 27.881 16.648C28.4624 10.9672 26.8878 6.04193 23.7187 1.67497ZM9.34871 13.6343C7.96567 13.6343 6.83149 12.4429 6.83149 10.9922C6.83149 9.54132 7.94144 8.34791 9.34871 8.34791C10.756 8.34791 11.8901 9.53924 11.8659 10.9922C11.8682 12.4429 10.756 13.6343 9.34871 13.6343ZM18.6512 13.6343C17.2682 13.6343 16.1339 12.4429 16.1339 10.9922C16.1339 9.54132 17.2439 8.34791 18.6512 8.34791C20.0584 8.34791 21.1926 9.53924 21.1684 10.9922C21.1684 12.4429 20.0584 13.6343 18.6512 13.6343Z"
                        fill="#4F4C67"
                      />
                    </svg>
                    <p className="mx-4 -mt-1">Discord</p>
                  </div>
                </a>

                <a
                  href="https://twitter.com/mangomarkets"
                  className="text-base font-medium text-white hover:bg-th-bkg-4"
                >
                  <div className="flex flex-row">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 28 28"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M8.78874 23C5.55374 23 2.53817 22.0591 0 20.4356C2.15499 20.5751 5.95807 20.2411 8.32358 17.9848C4.76508 17.8215 3.16026 15.0923 2.95094 13.926C3.25329 14.0426 4.6953 14.1826 5.50934 13.856C1.4159 12.8296 0.787928 9.23732 0.927477 8.14097C1.695 8.67749 2.99745 8.8641 3.50913 8.81744C-0.305207 6.08823 1.06703 1.98276 1.74151 1.09635C4.47882 4.88867 8.5812 7.01857 13.6564 7.13704C13.5607 6.71736 13.5102 6.28042 13.5102 5.83164C13.5102 2.61092 16.1134 0 19.3247 0C21.0025 0 22.5144 0.712754 23.5757 1.85284C24.6969 1.59011 26.3843 0.975068 27.2092 0.443205C26.7934 1.93611 25.4989 3.18149 24.7159 3.64308C24.7224 3.65878 24.7095 3.62731 24.7159 3.64308C25.4037 3.53904 27.2648 3.18137 28 2.68256C27.6364 3.52125 26.264 4.91573 25.1377 5.69642C25.3473 14.9381 18.2765 23 8.78874 23Z"
                        fill="#4F4C67"
                      />
                    </svg>
                    <p className="mx-4 -mt-1">Twitter</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBarBeta
