import { useEffect, useState } from 'react'
import { Menu } from '@headlessui/react'
import styled from '@emotion/styled'
import {
  ChevronUpIcon,
  ChevronDownIcon,
  DuplicateIcon,
  LogoutIcon,
} from '@heroicons/react/outline'
import ConnectWalletButton from './ConnectWalletButton'
import WalletIcon from './WalletIcon'
import useWalletStore from '../stores/useWalletStore'

const Code = styled.code`
  border: 1px solid hsla(0, 0%, 39.2%, 0.2);
  border-radius: 3px;
  background: hsla(0, 0%, 58.8%, 0.1);
  font-size: 13px;
`

const WALLET_OPTIONS = [
  { name: 'Copy address', icon: <DuplicateIcon /> },
  { name: 'Disconnect', icon: <LogoutIcon /> },
]

const TopBar = () => {
  const { connected, current: wallet } = useWalletStore((s) => s)
  const [isCopied, setIsCopied] = useState(false)

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCopied])

  const handleWalletMenu = (option) => {
    if (option === 'Copy address') {
      const el = document.createElement('textarea')
      el.value = wallet.publicKey.toString()
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setIsCopied(true)
    } else {
      wallet.disconnect()
    }
  }

  return (
    <nav className={`bg-th-bkg-2`}>
      <div className={`px-4 sm:px-6 lg:px-8`}>
        <div className={`flex justify-between h-16`}>
          <div className={`flex`}>
            <div className={`flex-shrink-0 flex items-center`}>
              <img className={`h-8 w-auto`} src="/logo.svg" alt="logo" />
            </div>
          </div>
          <div className="flex">
            <div className="flex items-center">
              <div className="hidden sm:ml-4 sm:block">
                {connected && wallet?.publicKey ? (
                  <Menu>
                    {({ open }) => (
                      <div className="relative">
                        <Menu.Button className="w-48 h-11 pl-2 pr-2.5 border border-th-green hover:border-th-fgd-1 focus:outline-none rounded-md text-th-fgd-4 hover:text-th-fgd-1">
                          <div className="flex flex-row items-center justify-between">
                            <div className="flex items-center">
                              <WalletIcon className="w-5 h-5 mr-2 fill-current text-th-green" />
                              <Code className="p-1 text-th-fgd-3 font-light">
                                {isCopied
                                  ? 'Copied!'
                                  : wallet.publicKey.toString().substr(0, 5) +
                                    '...' +
                                    wallet.publicKey.toString().substr(-5)}
                              </Code>
                            </div>
                            {open ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </div>
                        </Menu.Button>
                        <Menu.Items className="z-20 p-1 absolute right-0 top-11 bg-th-bkg-1 divide-y divide-th-bkg-3 shadow-lg outline-none rounded-md w-48">
                          {WALLET_OPTIONS.map(({ name, icon }) => (
                            <Menu.Item key={name}>
                              <button
                                className="flex flex-row items-center w-full p-2 hover:bg-th-bkg-2 hover:cursor-pointer font-normal"
                                onClick={() => handleWalletMenu(name)}
                              >
                                <div className="w-5 h-5 mr-2">{icon}</div>
                                {name}
                              </button>
                            </Menu.Item>
                          ))}
                        </Menu.Items>
                      </div>
                    )}
                  </Menu>
                ) : (
                  <ConnectWalletButton />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopBar
