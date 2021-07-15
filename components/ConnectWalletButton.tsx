import styled from '@emotion/styled'
import useWalletStore from '../stores/useWalletStore'
import { WALLET_PROVIDERS, DEFAULT_PROVIDER } from '../hooks/useWallet'
import useLocalStorageState from '../hooks/useLocalStorageState'
import WalletSelect from './WalletSelect'
import WalletIcon from './WalletIcon'
import { LinkIcon } from '@heroicons/react/solid'
import Button from './Button'

const StyledWalletTypeLabel = styled.div`
  font-size: 0.6rem;
`

const ConnectWalletButton = () => {
  const wallet = useWalletStore((s) => s.current)
  const [savedProviderUrl] = useLocalStorageState(
    'walletProvider',
    DEFAULT_PROVIDER.url
  )

  return (
    <div className="flex justify-between border border-primary-light hover:border-fgd-1 rounded-md h-11 w-48">
      <button
        onClick={() => wallet.connect()}
        disabled={!wallet}
        className="focus:outline-none disabled:text-fgd-4 disabled:cursor-wait"
      >
        <div className="flex flex-row items-center px-2 justify-center h-full rounded-l default-transition text-primary-light text-sm hover:bg-primary hover:text-fgd-1">
          <WalletIcon className="w-5 h-5 mr-3 fill-current" />
          <div>
            <span className="whitespace-nowrap">Connect Wallet</span>
            <StyledWalletTypeLabel className="font-normal text-fgd-1 text-left leading-3">
              {WALLET_PROVIDERS.filter((p) => p.url === savedProviderUrl).map(
                ({ name }) => name
              )}
            </StyledWalletTypeLabel>
          </div>
        </div>
      </button>
      <div className="relative h-full">
        <WalletSelect isPrimary />
      </div>
    </div>
  )
}

export default ConnectWalletButton

export const ConnectWalletButtonSmall = ({ connected, ...props }) => (
  <div className="relative">
    <Button
      className="rounded-full h-9 w-44 z-30 relative"
      gray={connected}
      {...props}
    >
      <LinkIcon className="h-4 w-4 relative top-1 mr-2" />
      {connected ? 'Disconnect' : 'Connect Wallet'}
    </Button>
    {!connected && (
      <div className="absolute animate-connect-wallet-ping bg-secondary-2-light top-0 rounded-full h-10 w-48" />
    )}
  </div>
)
