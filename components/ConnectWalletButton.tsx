import { Menu } from '@headlessui/react'
import { LinkIcon } from '@heroicons/react/solid'
import useWallet, { WALLET_PROVIDERS } from '../hooks/useWallet'
import Button from './Button'

const ChevronDownIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 9l-7 7-7-7"
    ></path>
  </svg>
)

const CheckIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 13l4 4L19 7"
    ></path>
  </svg>
)

const ConnectWalletButton = (props) => {
  const { connected, provider, setSavedProviderUrl } = useWallet()

  return (
    <div className="flex">
      <Button
        className={`h-9 z-30 px-8 flex items-center`}
        gray={connected}
        {...props}
      >
        <LinkIcon className="h-4 w-4 mr-2" />
        {connected ? 'Disconnect' : 'Connect Wallet'}
      </Button>

      <div className="relative pl-2">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button className="cursor-pointer rounded-full h-9 w-9 py-2 px-2 bg-bkg-4 hover:bg-bkg-3 focus:outline-none">
                {open ? (
                  <ChevronDownIcon className="w-4 h-4 m-auto stroke-3" />
                ) : (
                  <img src={provider?.icon} className="w-4 h-4 m-auto" />
                )}
              </Menu.Button>
              <Menu.Items className="z-20 p-1 absolute right-0 top-12 bg-bkg-1 shadow-lg border-2 border-bkg-3 outline-none rounded-2xl">
                {WALLET_PROVIDERS.map(({ name, url, icon }) => (
                  <Menu.Item key={name}>
                    <button
                      className="flex p-2 h-9 hover:bg-bkg-2 hover:cursor-pointer hover:rounded-2xl font-normal focus:outline-none"
                      onClick={() => setSavedProviderUrl(url)}
                      style={{ width: '14rem' }}
                    >
                      <img src={icon} className="h-4 w-4 mr-2" />
                      <span className="text-sm">{name}</span>

                      {provider?.url === url ? (
                        <CheckIcon className="h-4 w-4 text-green-400 stroke-3" />
                      ) : null}
                    </button>
                  </Menu.Item>
                ))}
              </Menu.Items>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

export default ConnectWalletButton
