import { useMemo } from 'react'
import { Menu } from '@headlessui/react'
import {
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
} from '@heroicons/react/solid'
import {
  getWalletProviderByUrl,
  WALLET_PROVIDERS,
} from '../utils/wallet-adapters'
import useWalletStore from '../stores/useWalletStore'
// import useLocalStorageState from '../hooks/useLocalStorageState'

export default function WalletSelect({ isPrimary = false }) {
  const {
    // connected,
    providerUrl,
    set: setWalletStore,
  } = useWalletStore((s) => s)

  const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [
    providerUrl,
  ])

  // const setMangoStore = useMangoStore((s) => s.set)
  // const [savedProviderUrl] = useLocalStorageState(
  //   PROVIDER_LOCAL_STORAGE_KEY,
  //   DEFAULT_PROVIDER.url
  // )

  return (
    <Menu>
      {({ open }) => (
        <>
          <Menu.Button
            className={`flex justify-center items-center h-full rounded-none focus:outline-none text-primary-light hover:text-fgd-1 ${
              isPrimary
                ? 'px-3 hover:bg-bkg-3'
                : 'px-2 hover:bg-bkg-3 border-l border-fgd-4'
            } cursor-pointer`}
          >
            {open ? (
              <ChevronUpIcon className="h-4 w-4" />
            ) : (
              <ChevronDownIcon className="h-4 w-4" />
            )}
          </Menu.Button>
          <Menu.Items className="absolute bg-bkg-1 divide-y divide-bkg-3 p-1 rounded-md right-0.5 mt-1 shadow-lg outline-none w-48 z-20">
            {WALLET_PROVIDERS.map(({ name, url, icon }) => (
              <Menu.Item key={name}>
                <button
                  className="flex flex-row items-center justify-between rounded-none w-full p-2 hover:bg-bkg-2 hover:cursor-pointer font-normal focus:outline-none"
                  onClick={() =>
                    setWalletStore((s) => {
                      s.providerUrl = url
                    })
                  }
                >
                  <div className="flex">
                    <img src={icon} className="w-5 h-5 mr-2" />
                    {name}
                  </div>
                  {provider?.url === url ? (
                    <CheckCircleIcon className="h-4 w-4 text-green" />
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
