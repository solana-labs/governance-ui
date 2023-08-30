import { useRouter } from 'next/router'
import { AddressImage, DisplayAddress } from '@cardinal/namespaces-components'
import styled from '@emotion/styled'
import { Menu } from '@headlessui/react'
import { UserCircleIcon } from '@heroicons/react/outline'
import {
  BackspaceIcon,
  CheckCircleIcon,
  ChevronDownIcon,
} from '@heroicons/react/solid'
import { abbreviateAddress } from '@utils/formatting'
import { useCallback, useEffect, useState } from 'react'
import Switch from './Switch'
import { notify } from '@utils/notifications'
import { Profile } from '@components/Profile'
import Loading from './Loading'
import { WalletName, WalletReadyState } from '@solana/wallet-adapter-base'
import { useWallet } from '@solana/wallet-adapter-react'
import { ExternalLinkIcon } from '@heroicons/react/outline'
import useLegacyConnectionContext from '@hooks/useLegacyConnectionContext'
import { DEFAULT_PROVIDER } from '../utils/wallet-adapters'
import useViewAsWallet from '@hooks/useViewAsWallet'

const StyledWalletProviderLabel = styled.p`
  font-size: 0.65rem;
  line-height: 1.5;
`

const ConnectWalletButton = (props) => {
  const { pathname, query, replace } = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const debugAdapter = useViewAsWallet()

  const {
    wallets,
    select,
    disconnect,
    connect,
    wallet,
    publicKey: realPublicKey,
    connected,
  } = useWallet()
  const connection = useLegacyConnectionContext()

  const publicKey = debugAdapter?.publicKey ?? realPublicKey

  useEffect(() => {
    if (wallet === null) select(DEFAULT_PROVIDER.name as WalletName)
  }, [select, wallet])

  const handleConnectDisconnect = useCallback(async () => {
    setIsLoading(true)
    try {
      if (connected) {
        await disconnect()
      } else {
        await connect()
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
  }, [connect, connected, disconnect])

  const currentCluster = query.cluster

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
    updateClusterParam(currentCluster !== 'devnet' ? 'devnet' : null)
  }

  const walletAddressFormatted = publicKey ? abbreviateAddress(publicKey) : ''

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
          {
            // TODO bring back debug wallet
          }
          {debugAdapter ? (
            <div className="absolute -left-4 h-full text-red-400 opacity-90 pointer-events-none text-2xl drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)] -rotate-45">
              DEBUG
            </div>
          ) : null}
          {connected && publicKey ? (
            <div className="hidden w-12 pr-2 sm:block">
              <AddressImage
                dark={true}
                connection={connection.current}
                address={publicKey}
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
              <img src={wallet?.adapter.icon} className="w-5 h-5" />
            </div>
          )}
          <div>
            {connected && publicKey ? (
              <>
                {connected && publicKey ? (
                  <DisplayAddress
                    connection={connection.current}
                    address={publicKey!}
                    width="100px"
                    height="20px"
                    dark={true}
                  />
                ) : null}
                <StyledWalletProviderLabel className="font-normal text-fgd-3">
                  {walletAddressFormatted}
                </StyledWalletProviderLabel>
              </>
            ) : (
              <>
                {isLoading ? <Loading></Loading> : 'Connect'}
                <StyledWalletProviderLabel className="font-normal text-fgd-3">
                  {wallet?.adapter.name}
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
                          onClick={() => select(name)}
                        >
                          <img src={icon} className="w-4 h-4 mr-2" />
                          <span className="text-sm">{name}</span>

                          {wallet?.adapter.name === name ? (
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
                  {wallet && publicKey && (
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
