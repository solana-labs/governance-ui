import { Menu } from '@headlessui/react'
import { useMemo } from 'react'
import { CheckIcon, ChevronDownIcon } from '@heroicons/react/solid'
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
        className={`bg-transparent border border-fgd-3 border-r-0 default-transition flex items-center h-12 pl-3 pr-4 rounded-l-full rounded-r-none w-36 focus:outline-none`}
        onClick={handleConnectDisconnect}
        {...props}
      >
        <div className="flex items-center text-fgd-1 text-left text-sm">
          <div className="pr-2">
            <img src={provider?.icon} className="h-5 w-5" />
          </div>
          <div>
            {connected ? 'Disconnect' : 'Connect'}
            <StyledWalletProviderLabel className="font-normal text-fgd-4">
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
                  connected ? 'border-bkg-4' : 'border-fgd-3'
                }`}
              >
                <ChevronDownIcon
                  className={`${
                    open ? 'transform rotate-180' : 'transform rotate-360'
                  } default-transition h-5 m-auto ml-1 text-primary-light w-5`}
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
                        <CheckIcon className="h-5 ml-4 text-green w-5" />
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
