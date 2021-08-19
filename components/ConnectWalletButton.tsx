// import { useMemo } from 'react'
import styled from '@emotion/styled'
// import useMangoStore from '../stores/useMangoStore'
import { Menu } from '@headlessui/react'
import { DuplicateIcon, LogoutIcon } from '@heroicons/react/outline'
// import {
//   WALLET_PROVIDERS,
//   DEFAULT_PROVIDER,
//   PROVIDER_LOCAL_STORAGE_KEY,
// } from '../hooks/useWallet'
import useWalletStore from '../stores/useWalletStore'
// import {
//   getWalletProviderByUrl,
//   WALLET_PROVIDERS,
// } from '../utils/wallet-adapters'
// import useLocalStorageState from '../hooks/useLocalStorageState'
import { copyToClipboard } from '../utils'
import WalletSelect from './WalletSelect'
import { WalletIcon, ProfileIcon } from './icons'

const StyledWalletTypeLabel = styled.div`
  font-size: 0.65rem;
`

const ConnectWalletButton = () => {
  const {
    connected,
    // providerUrl,
    // set: setWalletStore
  } = useWalletStore((s) => s)

  // const provider = useMemo(() => getWalletProviderByUrl(providerUrl), [
  //   providerUrl,
  // ])

  // const wallet = useMangoStore((s) => s.wallet.current)
  // const connected = useMangoStore((s) => s.wallet.connected)
  // const set = useMangoStore((s) => s.set)
  // const [selectedWallet, setSelectedWallet] = useState(DEFAULT_PROVIDER.url)
  // const [savedProviderUrl] = useLocalStorageState(
  //   PROVIDER_LOCAL_STORAGE_KEY,
  //   DEFAULT_PROVIDER.url
  // )

  // update in useEffect to prevent SRR error from next.js
  // useEffect(() => {
  //   setSelectedWallet(savedProviderUrl)
  // }, [savedProviderUrl])

  const handleWalletConect = () => {
    // wallet.connect()
    // set((state) => {
    //   state.selectedMangoAccount.initialLoad = true
    // })
  }

  return (
    <>
      {connected ? (
        <Menu>
          <div className="relative h-full">
            <Menu.Button className="bg-bkg-4 flex items-center justify-center rounded-full w-10 h-10 text-white focus:outline-none hover:bg-bkg-3 hover:text-fgd-3">
              <ProfileIcon className="h-6 w-6" />
            </Menu.Button>
            <Menu.Items className="bg-bkg-1 mt-2 p-1 absolute right-0 shadow-lg outline-none rounded-md w-48 z-20">
              <Menu.Item>
                <button
                  className="flex flex-row font-normal items-center rounded-none w-full p-2 hover:bg-bkg-2 hover:cursor-pointer focus:outline-none"
                  onClick={() => copyToClipboard('wallet?.publicKey')}
                >
                  <DuplicateIcon className="h-4 w-4" />
                  <div className="pl-2 text-left">Copy address</div>
                </button>
              </Menu.Item>
              <Menu.Item>
                <button
                  className="flex flex-row font-normal items-center rounded-none w-full p-2 hover:bg-bkg-2 hover:cursor-pointer focus:outline-none"
                  onClick={() => console.log('wallet.disconnect()')}
                >
                  <LogoutIcon className="h-4 w-4" />
                  <div className="pl-2 text-left">
                    <div className="pb-0.5">Disconnect</div>
                    <div className="text-fgd-4 text-xs">
                      {/* {abbreviateAddress(wallet?.publicKey)} */}
                    </div>
                  </div>
                </button>
              </Menu.Item>
            </Menu.Items>
          </div>
        </Menu>
      ) : (
        <div className="bg-bkg-1 h-14 flex divide-x divide-bkg-3 justify-between">
          <button
            onClick={handleWalletConect}
            // disabled={!wallet}
            className="rounded-none text-primary-light hover:bg-bkg-3 focus:outline-none disabled:text-fgd-4 disabled:cursor-wait"
          >
            <div className="flex flex-row items-center px-3 justify-center h-full default-transition hover:text-fgd-1">
              <WalletIcon className="w-4 h-4 mr-2 fill-current" />
              <div>
                <div className="mb-0.5 text-sm whitespace-nowrap">
                  Connect Wallet
                </div>
                <StyledWalletTypeLabel className="font-normal text-fgd-3 text-left leading-3 tracking-wider">
                  {/* {WALLET_PROVIDERS.find((p) => p.url === selectedWallet)?.name} */}
                </StyledWalletTypeLabel>
              </div>
            </div>
          </button>
          <div className="relative h-full">
            <WalletSelect isPrimary />
          </div>
        </div>
      )}
    </>
  )
}

export default ConnectWalletButton
