import { useRouter } from 'next/router'
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
import { useEffect, useMemo, useState } from 'react'
import useLocalStorageState from '../hooks/useLocalStorageState'
import useWalletStore from '../stores/useWalletStore'
import { getWalletProviderByName } from '../utils/wallet-adapters'
import Switch from './Switch'
import { TwitterIcon } from './icons'
import { notify } from '@utils/notifications'
import { Profile } from '@components/Profile'
import Loading from './Loading'
import { WalletReadyState } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import useInitWallet from '@hooks/useInitWallet'
import { ExternalLinkIcon } from '@heroicons/react/outline'

const StyledWalletProviderLabel = styled.p`
  font-size: 0.65rem;
  line-height: 1.5;
`

const ConnectWalletButton = (props) => {
  useInitWallet()
  const { pathname, query, replace } = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [currentCluster, setCurrentCluster] = useLocalStorageState(
    'cluster',
    'mainnet'
  )
  const { wallets } = useWallet()

  const {
    connected,
    current,
    providerName,
    connection,
    set: setWalletStore,
  } = useWalletStore((s) => s)

  const provider = useMemo(
    () => getWalletProviderByName(providerName, wallets),
    [providerName, wallets]
  )

  useEffect(() => {
    if (connection.cluster !== currentCluster) {
      setCurrentCluster(connection.cluster)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [connection.cluster])

  function updateClusterParam(cluster) {
    const newQuery = {
      ...query,
      cluster,
    }
    if (!cluster) {
      delete newQuery.cluster
    }
    replace({ pathname, query: newQuery }, undefined, {
      shallow: true,
    })
  }

  function handleToggleDevnet() {
    const isDevnet = !(currentCluster === 'devnet')
    setCurrentCluster(isDevnet ? 'devnet' : 'mainnet')
    updateClusterParam(isDevnet ? 'devnet' : null)
  }

  const handleConnectDisconnect = async () => {
    setIsLoading(true)
    try {
      if (connected) {
        await current?.disconnect()
      } else {
        await current?.connect()
      }
    } catch (e: any) {
      if (e.name === 'WalletNotReadyError') {
        notify({
          type: 'error',
          message: 'You must have a wallet installed to connect',
        })
      }
      console.warn('handleConnectDisconnect', e)
    }
    setIsLoading(false)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [current?.publicKey?.toBase58()])

  const displayAddressImage = useMemo(() => {
    return connected && current?.publicKey ? (
      <div className="hidden w-12 pr-2 sm:block">
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
      <div className="hidden pl-2 pr-2 sm:block">
        <img src={provider?.adapter.icon} className="w-5 h-5" />
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [provider])

  return (
    <div className="flex">
      <div
        disabled={connected}
        className={`bg-bkg-2 hover:bg-bkg-3  border border-fgd-4 border-r-0 default-transition flex h-12 items-center pl-4 pr-3 sm:pl-1 sm:pr-2 rounded-l-full rounded-r-none ${
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
                {isLoading ? <Loading></Loading> : 'Connect'}
                <StyledWalletProviderLabel className="font-normal text-fgd-3">
                  {provider?.adapter?.name}
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
                className={`border bg-bkg-2 border-fgd-4 cursor-pointer default-transition h-12 w-12 py-2 px-2 rounded-r-full hover:bg-bkg-3 focus:outline-none`}
              >
                <ChevronDownIcon
                  className={`${
                    open ? 'transform rotate-180' : 'transform rotate-360'
                  } default-transition h-5 m-auto ml-1 text-primary-light w-5`}
                />
              </Menu.Button>
              <Menu.Items className="absolute right-0 z-20 w-48 p-2 border rounded-md shadow-md outline-none bg-bkg-1 border-fgd-4 top-14">
                <>
                  {wallets
                    .filter(
                      ({ adapter }) =>
                        adapter.readyState !== WalletReadyState.Unsupported
                    )
                    .map(({ adapter: { icon, name } }) => (
                      <Menu.Item key={name}>
                        <button
                          className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none"
                          onClick={() =>
                            setWalletStore((s) => {
                              s.providerName = name
                            })
                          }
                        >
                          <img src={icon} className="w-4 h-4 mr-2" />
                          <span className="text-sm">{name}</span>

                          {provider?.adapter?.name === name ? (
                            <CheckCircleIcon className="w-5 h-5 ml-2 text-green" />
                          ) : null}
                        </button>
                      </Menu.Item>
                    ))}
                  <Menu.Item key={'devnet'}>
                    <div className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none">
                      <span className="text-sm">Devnet</span>
                      <Switch
                        checked={currentCluster === 'devnet'}
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
                      <Menu.Item key={'profile'}>
                        <div className="p-2">
                          <Profile />
                        </div>
                      </Menu.Item>
                      <hr
                        className={`border border-fgd-3 opacity-50 mt-2 mb-2`}
                      ></hr>
                      <Menu.Item key={'twitter'}>
                        <button
                          className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none"
                          onClick={() =>
                            show(
                              // @ts-ignore
                              current,
                              connection.current,
                              connection.cluster
                            )
                          }
                        >
                          <TwitterIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">
                            {displayName ? 'Edit Twitter' : 'Link Twitter'}
                          </span>
                        </button>
                      </Menu.Item>
                      <Menu.Item key={'disconnect'}>
                        <button
                          className="flex items-center w-full p-2 font-normal default-transition h-9 hover:bg-bkg-3 hover:cursor-pointer hover:rounded focus:outline-none"
                          onClick={handleConnectDisconnect}
                        >
                          <BackspaceIcon className="w-4 h-4 mr-2" />
                          <span className="text-sm">Disconnect</span>
                        </button>
                      </Menu.Item>
                    </>
                  )}
                  <hr className="border border-fgd-3 opacity-50 mt-2 mb-2 sm:hidden" />
                  <Menu.Item>
                    <a
                      className="flex items-center p-2 rounded transition-colors sm:hidden hover:bg-bkg-3"
                      href="https://docs.realms.today/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      <ExternalLinkIcon className="w-4 h-4 mr-2 stroke-white" />
                      <div className="text-white text-sm">Read the Docs</div>
                    </a>
                  </Menu.Item>
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
