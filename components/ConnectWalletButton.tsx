import {
  AddressImage,
  DisplayAddress,
  useAddressName,
  useWalletIdentity,
} from '@cardinal/namespaces-components'
import styled from '@emotion/styled'
import { Menu } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/outline'
import {
  BackspaceIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/solid'
import { abbreviateAddress } from '@utils/formatting'
import { useEffect, useMemo } from 'react'
import useLocalStorageState from '../hooks/useLocalStorageState'
import useWalletStore from '../stores/useWalletStore'
import {
  getWalletProviderByUrl,
  WALLET_PROVIDERS,
} from '../utils/wallet-adapters'
import Switch from './Switch'
import TwitterIcon from './TwitterIcon'

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

  const [useDevnet, setUseDevnet] = useLocalStorageState('false')
  const handleToggleDevnet = () => {
    setUseDevnet(!useDevnet)
    if (useDevnet) {
      window.location.href = `${window.location.pathname}`
    } else {
      window.location.href = `${window.location.href}?cluster=devnet`
    }
  }
  useEffect(() => {
    setUseDevnet(connection.cluster === 'devnet')
  }, [connection.cluster])

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
  const displayAddressComponent = useMemo(() => {
    return connected && current?.publicKey ? (
      <DisplayAddress
        connection={connection.current}
        address={current.publicKey!}
        width="100px"
        height="20px"
        dark={true}
      />
    ) : null
  }, [current?.publicKey?.toBase58()])

  const displayAddressImage = useMemo(() => {
    return connected && current?.publicKey ? (
      <div className="w-12 pr-2">
        <AddressImage
          dark={true}
          connection={connection.current}
          address={current?.publicKey}
          height="40px"
          width="40px"
          placeholder={
            <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 mr-2 rounded-full bg-bkg-4">
              <UserCircleIcon className="h-9 text-fgd-3 w-9" />
            </div>
          }
        />{' '}
      </div>
    ) : (
      <div className="pl-2 pr-2">
        <img src={provider?.adapter.icon} className="w-5 h-5" />
      </div>
    )
  }, [provider])

  return (
    <div className="flex">
      <div
        disabled={connected}
        className={`bg-transparent border border-fgd-4 border-r-0 default-transition flex h-12 items-center pl-1 pr-2 rounded-l-full rounded-r-none ${
          connected
            ? 'cursor-default'
            : 'cursor-pointer hover:bg-bkg-3 focus:outline-none'
        }`}
        onClick={handleConnectDisconnect}
        {...props}
      >
        <div className="relative flex items-center text-sm font-bold text-left text-fgd-1">
          {displayAddressImage}
          <div>
            {connected && current?.publicKey ? (
              <>
                {displayAddressComponent}
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
      </div>

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
              <Menu.Items className="absolute right-0 z-20 w-48 p-2 border rounded-md shadow-md outline-none bg-bkg-1 border-fgd-4 top-14">
                <>
                  {WALLET_PROVIDERS.map(({ name, url, adapter: { icon } }) => (
                    <Menu.Item key={name}>
                      <button
                        className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none"
                        onClick={() =>
                          setWalletStore((s) => {
                            s.providerUrl = url
                          })
                        }
                      >
                        <img src={icon} className="w-4 h-4 mr-2" />
                        <span className="text-sm">{name}</span>

                        {provider?.url === url ? (
                          <CheckCircleIcon className="w-5 h-5 ml-2 text-green" />
                        ) : null}
                      </button>
                    </Menu.Item>
                  ))}
                  <Menu.Item key={'devnet'}>
                    <div className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none">
                      <span className="text-sm">Devnet</span>
                      <Switch
                        checked={useDevnet}
                        onChange={() => {
                          handleToggleDevnet()
                        }}
                      />
                    </div>
                  </Menu.Item>
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
                        <button className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none">
                          <TwitterIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {displayName ? 'Edit Twitter' : 'Link Twitter'}
                          </span>
                        </button>
                      </Menu.Item>
                      <Menu.Item
                        key={'disconnect'}
                        onClick={handleConnectDisconnect}
                      >
                        <button className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none">
                          <BackspaceIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">Disconnect</span>
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
