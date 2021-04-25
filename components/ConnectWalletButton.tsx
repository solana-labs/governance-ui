import styled from '@emotion/styled'
import useWalletStore from '../stores/useWalletStore'
import { WALLET_PROVIDERS, DEFAULT_PROVIDER } from '../hooks/useWallet'
import useLocalStorageState from '../hooks/useLocalStorageState'
import WalletSelect from './WalletSelect'
import WalletIcon from './WalletIcon'

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
    <div className="flex justify-between border border-th-primary rounded-md h-11 w-48">
      <button
        onClick={() => wallet.connect()}
        disabled={!wallet}
        className="text-th-primary hover:text-th-fgd-1 focus:outline-none disabled:text-th-fgd-4 disabled:cursor-wait"
      >
        <div className="flex flex-row items-center px-2 justify-center h-full rounded-l default-transition hover:bg-th-primary hover:text-th-fgd-1">
          <WalletIcon className="w-5 h-5 mr-3 fill-current" />
          <div>
            <span className="whitespace-nowrap">Connect Wallet</span>
            <StyledWalletTypeLabel className="font-normal text-th-fgd-1 text-left leading-3">
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
