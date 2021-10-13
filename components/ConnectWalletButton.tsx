import { Menu } from '@headlessui/react'
import { useMemo } from 'react'
import styled from '@emotion/styled'
import useWalletStore from '../stores/useWalletStore'
import {
  getWalletProviderByUrl,
  WALLET_PROVIDERS,
} from '../utils/wallet-adapters'
import Button from './Button'

const StyledWalletProviderLabel = styled.p`
  font-size: 0.65rem;
  line-height: 1.5;
`

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
  const {
    connected,
    current,
    providerUrl,
    set: setWalletStore,
  } = useWalletStore((s) => s)

  const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [
    providerUrl,
  ])

  const handleConnectDisconnect = () => {
    if (connected) {
      current.disconnect()
    } else {
      current.connect()
    }
  }

  return (
    <div className="flex">
      <Button
        className={`default-transition flex items-center h-12 pl-3 pr-4 rounded-l-full rounded-r-none w-36 hover:bg-bkg-3 focus:outline-none`}
        gray={connected}
        onClick={handleConnectDisconnect}
        {...props}
      >
        <div className="flex items-center text-left text-sm">
          <div className="bg-[rgba(0,0,0,0.2)] flex h-7 items-center justify-center rounded-full w-7 mr-2">
            <img src={provider?.icon} className="h-4 w-4" />
          </div>
          <div>
            {connected ? 'Disconnect' : 'Connect'}
            <StyledWalletProviderLabel className="font-normal text-fgd-1">
              {provider?.name}
            </StyledWalletProviderLabel>
          </div>
        </div>
      </Button>

      <div className="relative ">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                className={`border cursor-pointer default-transition h-12 w-12 py-2 px-2 rounded-r-full hover:bg-bkg-3 focus:outline-none ${
                  connected ? 'border-bkg-4' : 'border-primary-light'
                }`}
              >
                <ChevronDownIcon
                  className={`${
                    open ? 'transform rotate-180' : 'transform rotate-360'
                  } default-transition h-4 m-auto ml-1 stroke-3 text-primary-light w-4`}
                />
              </Menu.Button>
              <Menu.Items className="z-20 w-auto p-2 absolute right-0 top-14 bg-bkg-2 border border-bkg-3 shadow-md outline-none rounded-md">
                {WALLET_PROVIDERS.map(({ name, url, icon }) => (
                  <Menu.Item key={name}>
                    <button
                      className="flex default-transition h-9 items-center p-2 w-auto hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none"
                      onClick={() =>
                        setWalletStore((s) => {
                          s.providerUrl = url
                        })
                      }
                      style={{ width: '14rem' }}
                    >
                      <img src={icon} className="h-4 w-4 mr-2" />
                      <span className="text-sm">{name}</span>

                      {provider?.url === url ? (
                        <CheckIcon className="h-5 ml-4 stroke-3 text-green w-5" />
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
