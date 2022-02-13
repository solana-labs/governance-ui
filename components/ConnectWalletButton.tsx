import { Menu } from '@headlessui/react'
import { useMemo, useState } from 'react'
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/solid'
import styled from '@emotion/styled'
import useWalletStore from '../stores/useWalletStore'
import {
  getWalletProviderByUrl,
  WALLET_PROVIDERS,
} from '../utils/wallet-adapters'
import {
  AddressImage,
  DisplayAddress,
  useAddressName,
  useWalletIdentity,
} from '@cardinal/namespaces-components'
import { BackspaceIcon } from '@heroicons/react/solid'
import { UserCircleIcon } from '@heroicons/react/outline'
import { abbreviateAddress } from '@utils/formatting'
import { useRouter } from 'next/router'
import TwitterIcon from './TwitterIcon'
import Switch from './Switch'

const StyledWalletProviderLabel = styled.p`
  font-size: 0.65rem;
  line-height: 1.5;
`

const ConnectWalletButton = (props) => {
  const {
    connected,
    current,
    providerUrl,
    connection,
    set: setWalletStore,
  } = useWalletStore((s) => s)

  const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [
    providerUrl,
  ])

  const [useDevnet, setUseDevnet] = useState(false)
  const router = useRouter()
  const handleToggleDevnet = () => {
    setUseDevnet(!useDevnet)
    if (useDevnet) {
      router.push(`${window.location.pathname}`)
    } else {
      router.push(`${window.location.href}?cluster=devnet`)
    }
  }

  const handleConnectDisconnect = async () => {
    try {
      if (connected) {
        await current?.disconnect()
      } else {
        await current?.connect()
      }
    } catch (e) {
      console.warn('handleConnectDisconnect', e)
    }
  }

  const { show } = useWalletIdentity()

  const { displayName } = useAddressName(
    connection.current,
    current?.publicKey || undefined
  )

  const walletAddressFormatted = current?.publicKey
    ? abbreviateAddress(current?.publicKey)
    : ''

  return (
    <div className="flex">
      <button
        disabled={connected}
        className={`bg-transparent border border-fgd-4 border-r-0 default-transition flex h-12 items-center pl-1 pr-2 rounded-l-full rounded-r-none ${
          connected ? 'cursor-default' : 'hover:bg-bkg-3 focus:outline-none'
        }`}
        onClick={handleConnectDisconnect}
        {...props}
      >
        <div className="flex font-bold items-center text-fgd-1 text-left text-sm relative">
          {connected && current?.publicKey ? (
            <div className="w-12 pr-2">
              <AddressImage
                dark={true}
                connection={connection.current}
                address={current?.publicKey}
                height="40px"
                width="40px"
                placeholder={
                  <div className="bg-bkg-4 flex flex-shrink-0 items-center justify-center h-10 rounded-full w-10 mr-2">
                    <UserCircleIcon className="h-9 text-fgd-3 w-9" />
                  </div>
                }
              />
            </div>
          ) : (
            <div className="pr-2 pl-2">
              <img src={provider?.icon} className="h-5 w-5" />
            </div>
          )}
          <div>
            {connected && current?.publicKey ? (
              <>
                <DisplayAddress
                  connection={connection.current}
                  address={current?.publicKey}
                  width="100px"
                  height="20px"
                  dark={true}
                />
                <StyledWalletProviderLabel className="font-normal text-fgd-3">
                  {walletAddressFormatted}
                </StyledWalletProviderLabel>
              </>
            ) : (
              <>
                Connect
                <StyledWalletProviderLabel className="font-normal text-fgd-3">
                  {provider?.name}
                </StyledWalletProviderLabel>
              </>
            )}
          </div>
        </div>
      </button>

      <div className="relative ">
        <Menu>
          {({ open }) => (
            <>
              <Menu.Button
                className={`border border-fgd-4 cursor-pointer default-transition h-12 w-12 py-2 px-2 rounded-r-full hover:bg-bkg-3 focus:outline-none`}
              >
                <ChevronDownIcon
                  className={`${
                    open ? 'transform rotate-180' : 'transform rotate-360'
                  } default-transition h-5 m-auto ml-1 text-primary-light w-5`}
                />
              </Menu.Button>
              <Menu.Items className="absolute bg-bkg-1 border border-fgd-4 p-2 right-0 top-14 shadow-md outline-none rounded-md w-48 z-20">
                <>
                  {WALLET_PROVIDERS.map(({ name, url, icon }) => (
                    <Menu.Item key={name}>
                      <button
                        className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none"
                        onClick={() =>
                          setWalletStore((s) => {
                            s.providerUrl = url
                          })
                        }
                      >
                        <img src={icon} className="h-4 w-4 mr-2" />
                        <span className="text-sm">{name}</span>

                        {provider?.url === url ? (
                          <CheckCircleIcon className="h-5 ml-2 text-green w-5" />
                        ) : null}
                      </button>
                    </Menu.Item>
                  ))}

                  {current && current.publicKey && (
                    <>
                      <hr
                        className={`border border-fgd-3 opacity-50 mt-2 mb-2`}
                      ></hr>
                      <Menu.Item
                        key={'twitter'}
                        onClick={() =>
                          show(
                            // @ts-ignore
                            current,
                            connection.current,
                            connection.cluster
                          )
                        }
                      >
                        <button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
                          <TwitterIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm">
                            {displayName ? 'Edit Twitter' : 'Link Twitter'}
                          </span>
                        </button>
                      </Menu.Item>
                      <Menu.Item
                        key={'disconnect'}
                        onClick={handleConnectDisconnect}
                      >
                        <button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
                          <BackspaceIcon className="h-4 w-4 mr-2" />
                          <span className="text-sm">Disconnect</span>
                        </button>
                      </Menu.Item>
                      <Menu.Item
                        key={'devnet'}
                        onClick={() => {
                          handleToggleDevnet()
                        }}
                      >
                        <button className="flex default-transition h-9 items-center p-2 w-full hover:bg-bkg-3 hover:cursor-pointer hover:rounded font-normal focus:outline-none">
                          <span className="text-sm">Devnet</span>
                          <Switch
                            checked={useDevnet}
                            onChange={() => {
                              handleToggleDevnet()
                            }}
                          />
                        </button>
                      </Menu.Item>
                    </>
                  )}
                </>
              </Menu.Items>
            </>
          )}
        </Menu>
      </div>
    </div>
  )
}

export default ConnectWalletButton
