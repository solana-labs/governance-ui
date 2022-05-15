import { Fragment, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import {
  AddressImage,
  useAddressName,
  useWalletIdentity,
} from '@cardinal/namespaces-components'

import useWalletStore from '../stores/useWalletStore'
import {
  getWalletProviderByUrl,
  WALLET_PROVIDERS,
} from '../utils/wallet-adapters'
import { notify } from '@utils/notifications'

import useLocalStorageState from '../hooks/useLocalStorageState'

import { UserCircleIcon, LogoutIcon } from '@heroicons/react/outline'
import { Menu, Transition } from '@headlessui/react'
import { CheckCircleIcon, ChevronDownIcon } from '@heroicons/react/solid'

import Text from './Text'
import Button from './Button'
import Switch from '../components/Switch'
import DisplayAddress from './DisplayAddress'

const ConnectWalletButton = () => {
  const { pathname, query, replace } = useRouter()
  const [useDevnet, setUseDevnet] = useLocalStorageState('false')
  const {
    connected,
    current,
    providerUrl,
    connection,
    set: setWalletStore,
  } = useWalletStore((s) => s)
  const { show } = useWalletIdentity()
  const { displayName, loadingName } = useAddressName(
    connection.current,
    current?.publicKey || undefined
  )
  const [walletConnectionPending, setWalletConnectionPending] = useState(false)
  const walletConnected = connected && current?.publicKey
  const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [
    providerUrl,
  ])

  useEffect(() => {
    setUseDevnet(connection.cluster === 'devnet')
  }, [connection.cluster])

  useEffect(() => {
    // Auto connect when user refreshes the page
    if (!connected && current && current?.url === provider?.url) {
      handleConnectDisconnect()
    }
  }, [provider, current])

  useEffect(() => {
    // Connect to wallet on wallet select without the user having the click twice
    async function connect() {
      await handleConnectDisconnect()
      setWalletConnectionPending(false)
    }
    if (walletConnectionPending && current && current?.url === provider?.url) {
      connect()
    }
  }, [walletConnectionPending, provider, current])

  function handleToggleDevnet() {
    const devnetEnabled = !useDevnet
    setUseDevnet(devnetEnabled)
    replace(
      { pathname, query: { ...query, cluster: devnetEnabled ? 'devnet' : '' } },
      undefined,
      { shallow: true }
    )
  }

  async function handleConnectDisconnect() {
    try {
      if (connected) {
        await current?.disconnect()
      } else {
        await current?.connect()
      }
    } catch (error) {
      const err = error as Error
      return notify({
        type: 'error',
        message: err.message || 'User cancelled request',
      })
    }
  }

  async function handleCancelConnect() {
    try {
      if (connected) {
        await current?.disconnect()
      }
      setWalletConnectionPending(false)
    } catch (error) {
      const err = error as Error
      return notify({
        type: 'error',
        message: err.message,
      })
    }
  }

  async function handleTwitterIntegration() {
    try {
      // @ts-ignore
      await show(current, connection.current, connection.cluster)
    } catch (error) {
      const err = error as Error
      return notify({
        type: 'error',
        message: err.message,
      })
    }
  }

  return (
    <Menu as="div" className="relative inline-block w-40 text-left md:w-56">
      {({ open }) => (
        <>
          <div>
            {walletConnected ? (
              <Menu.Button className="flex items-center justify-between w-full px-4 py-3 font-serif text-white bg-[#201f2799] rounded-md hover:brightness-75 focus:brightness-75  focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-opacity-100">
                <div className="flex items-center text-[16px]">
                  <div className="w-12 pr-2">
                    <AddressImage
                      dark={true}
                      connection={connection.current}
                      address={current?.publicKey || undefined}
                      height="40px"
                      width="40px"
                      placeholder={
                        <div className="flex">
                          <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-2 rounded-full bg-bkg-4">
                            <UserCircleIcon className="h-9 text-fgd-3 w-9" />
                          </div>
                        </div>
                      }
                    />
                  </div>
                  <DisplayAddress
                    address={current.publicKey!}
                    displayName={displayName!}
                    loadingName={loadingName!}
                    width="100px"
                    height="20px"
                    dark={true}
                  />
                </div>
                <div className="text-white md:flex hidden justify-center items-center rounded-full h-6 w-6 bg-[#292833]">
                  <ChevronDownIcon
                    className={`${
                      open ? '' : 'rotate-180'
                    } default-transition transform h-5 w-5`}
                  />
                </div>
              </Menu.Button>
            ) : (
              <Menu.Button className="flex items-center justify-between w-full px-4 py-3 font-serif text-black bg-white rounded-md hover:brightness-75 focus-visible:brightness-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue focus-visible:ring-opacity-100">
                <div className="w-full flex items-center text-[16px] justify-center md:justify-start">
                  {walletConnectionPending ? (
                    <img
                      src={current?.icon}
                      alt={current?.name + ' logo'}
                      className="w-6 h-6 mr-2"
                    />
                  ) : (
                    <img
                      src="/1-Landing-v2/icon-wallet-black.svg"
                      alt="icon"
                      className="mr-2"
                    />
                  )}
                  <span className="hidden md:block">Wallet</span>
                  <span>Sign-In</span>
                </div>
                <div
                  className={`${
                    open ? '' : 'rotate-180'
                  } default-transition transform text-white hidden md:flex justify-center items-center rounded-full h-6 w-6 bg-[#292833]`}
                >
                  <ChevronDownIcon
                    className={`${
                      open ? '' : 'top-[1px]'
                    } default-transition relative w-5 h-5`}
                  />
                </div>
              </Menu.Button>
            )}
          </div>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 w-full mt-2 origin-top-right bg-[#201f27] rounded-md shadow-lg ring-1 ring-black text-white ring-opacity-5 focus:outline-none">
              <div className="flex flex-col px-2 py-2 overflow-scroll h-full max-h-[calc(100vh_-_120px)]">
                {walletConnectionPending ? (
                  <div className="flex flex-col items-center w-full pt-8">
                    <div className='relative mt-0 bg-contain bg-center bg-no-repeat bg-[url("/1-Landing-v2/logo-realms-blue.png")]'>
                      <div className="double-gradient-horizontal-rule"></div>
                      <div className="double-gradient-horizontal-rule"></div>
                      <div className="double-gradient-horizontal-rule"></div>
                    </div>
                    <div className="mt-4 text-center">
                      <Text>
                        Connecting to <br /> {provider?.name}...
                      </Text>
                    </div>
                    <div className="flex flex-col justify-end pt-8 pb-4 grow">
                      <Button
                        secondary
                        type="button"
                        onClick={handleCancelConnect}
                      >
                        <div className="flex justify-center px-6">
                          <Text level="2">Cancel</Text>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : walletConnected ? (
                  <div className="flex flex-col items-center w-full pt-6 pb-4">
                    <Text level="3" className="opacity-60">
                      You are connected via
                    </Text>
                    <div className="flex items-center mt-2 text-center">
                      <img src={provider?.icon} className="w-8 h-8 mr-3" />
                      <Text level="2">{provider?.name}</Text>
                    </div>
                    <div className="flex flex-col w-full mt-6 space-y-2">
                      <Button
                        secondary
                        type="button"
                        onClick={handleConnectDisconnect}
                      >
                        <div className="flex justify-center">
                          <LogoutIcon className="h-4 mr-1" />
                          <Text level="2">Disconnect</Text>
                        </div>
                      </Button>
                      <Button
                        secondary
                        type="button"
                        onClick={handleTwitterIntegration}
                      >
                        <div className="relative flex items-center justify-center px-4">
                          <svg
                            className="fill-[#6496f6] stroke-[#6496f6]"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M23 3.00005C22.0424 3.67552 20.9821 4.19216 19.86 4.53005C19.2577 3.83756 18.4573 3.34674 17.567 3.12397C16.6767 2.90121 15.7395 2.95724 14.8821 3.2845C14.0247 3.61176 13.2884 4.19445 12.773 4.95376C12.2575 5.71308 11.9877 6.61238 12 7.53005V8.53005C10.2426 8.57561 8.50127 8.18586 6.93101 7.39549C5.36074 6.60513 4.01032 5.43868 3 4.00005C3 4.00005 -1 13 8 17C5.94053 18.398 3.48716 19.099 1 19C10 24 21 19 21 7.50005C20.9991 7.2215 20.9723 6.94364 20.92 6.67005C21.9406 5.66354 22.6608 4.39276 23 3.00005V3.00005Z"
                              stroke="none"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          <Text level="2" className="pl-2">
                            {displayName ? 'Edit' : 'Connect'} Twitter
                          </Text>
                        </div>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center mx-auto mt-10">
                      <img
                        src="/1-Landing-v2/logo-solana-gradient.svg"
                        alt="Solana logo"
                        className="w-6 h-6 mx-auto"
                      />
                      <div className="flex flex-col">
                        <div className="gradiented-horizontal-rule1"></div>
                        <div className="gradiented-horizontal-rule1"></div>
                        <div className="gradiented-horizontal-rule1"></div>
                      </div>
                      <img
                        src="/1-Landing-v2/logo-realms-blue.png"
                        alt="Realms logo"
                        className="w-10 h-10"
                      />
                    </div>
                    <div className="px-2 mt-4 mb-8 text-center md:px-7">
                      <Text level="2">
                        Which Solana wallet would you like to use?{' '}
                      </Text>
                    </div>
                    <div className="space-y-2">
                      {WALLET_PROVIDERS.map(({ name, url, adapter }) => (
                        <Menu.Item key={name}>
                          {({ active }) => (
                            <button
                              type="button"
                              className={`flex items-center w-full px-4 py-2 font-normal default-transition bg-[#292833] hover:cursor-pointer rounded hover:brightness-110 focus:outline-none ${
                                active
                                  ? 'brightness-110 ring-2 ring-white ring-opacity-75'
                                  : ''
                              }`}
                              onClick={() => {
                                setWalletConnectionPending(true)
                                setWalletStore((s) => {
                                  s.providerUrl = url
                                })
                              }}
                            >
                              <img
                                src={adapter?.icon}
                                className="w-6 h-6 mr-3"
                              />
                              <div
                                className={`flex w-full md:flex-row ${
                                  provider?.url === url
                                    ? 'items-center'
                                    : 'flex-col items-baseline justify-between'
                                }`}
                              >
                                <Text level="2">{name}</Text>
                                {provider?.url === url ? (
                                  <CheckCircleIcon className="w-5 h-5 ml-2 text-green item-center" />
                                ) : adapter?.readyState === 'Installed' ? (
                                  <Text level="3" className="opacity-50">
                                    Detected
                                  </Text>
                                ) : null}
                              </div>
                            </button>
                          )}
                        </Menu.Item>
                      ))}
                    </div>
                  </>
                )}
                <Menu.Item>
                  {(active) => (
                    <div
                      onClick={handleToggleDevnet}
                      className={`flex items-center p-2 m-auto mt-2 w-fit default-transition h-9 hover:cursor-pointer rounded focus:outline-none ${
                        active
                          ? 'brightness-110 hover:ring-2 ring-white ring-opacity-75'
                          : ''
                      }`}
                    >
                      <Text level="2">Devnet</Text>
                      <Switch
                        checked={useDevnet}
                        onChange={handleToggleDevnet}
                      />
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  )
}

export default ConnectWalletButton
