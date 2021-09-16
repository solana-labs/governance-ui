import useRealm from '../hooks/useRealm'
import { getResourceName } from '../tools/core/resources'
import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  const { realm, realmInfo } = useRealm()

  // TODO: Show solana/realms branding when on the home page

  return (
    <div className="bg-bkg-1 flex h-20 items-center justify-between px-6">
      <div className="flex justify-start lg:w-0 lg:flex-1">
        {realm && (
          <a href={`${realmInfo?.website}`}>
            <span className="sr-only">{realm?.info.name}</span>

            <img
              className="h-7"
              src={`/realms/${getResourceName(realm?.info.name)}/img/logo.svg`}
              alt={realm?.info.name}
              width="auto"
            />
          </a>
        )}
      </div>
      <ConnectWalletButton />
    </div>
  )
}

export default NavBar
