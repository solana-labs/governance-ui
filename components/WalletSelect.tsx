import { Menu } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/outline'

import useWalletStore from '../stores/useWalletStore'
import { WALLET_PROVIDERS, DEFAULT_PROVIDER } from '../hooks/useWallet'
import useLocalStorageState from '../hooks/useLocalStorageState'

export default function WalletSelect({ isPrimary = false }) {
  const setWalletStore = useWalletStore((s) => s.set)
  const [savedProviderUrl] = useLocalStorageState(
    'walletProvider',
    DEFAULT_PROVIDER.url
  )

  const handleSelectProvider = (url) => {
    setWalletStore((state) => {
      state.providerUrl = url
    })
  }

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            className={`flex justify-center items-center h-full rounded-r rounded-l-none focus:outline-none text-th-primary hover:text-th-fgd-1 ${
              isPrimary
                ? 'px-3 hover:bg-th-primary'
                : 'px-2 hover:bg-th-bkg-3 border-l border-th-fgd-4'
            } cursor-pointer`}
          >
            {open ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </Menu.Button>
          <Menu.Items className="z-20 p-1 absolute right-0 top-11 bg-th-bkg-1 divide-y divide-th-bkg-3 shadow-lg outline-none rounded-md w-48">
            {WALLET_PROVIDERS.map(({ name, url, icon }) => (
              <Menu.Item key={name}>
                <button
                  className="flex flex-row items-center justify-between w-full p-2 hover:bg-th-bkg-2 hover:cursor-pointer font-normal focus:outline-none"
                  onClick={() => handleSelectProvider(url)}
                >
                  <div className="flex">
                    <img src={icon} className="w-5 h-5 mr-2" />
                    {name}
                  </div>
                  {savedProviderUrl === url ? (
                    <CheckCircleIcon className="h-4 w-4 text-th-green" />
                  ) : null}{' '}
                </button>
              </Menu.Item>
            ))}
          </Menu.Items>
        </>
      )}
    </Menu>
  )
}
