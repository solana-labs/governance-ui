import useRealm from '../hooks/useRealm'
import { getResourceName } from '../tools/core/resources'
import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  const { realm, realmInfo } = useRealm()

  // TODO: Show solana/realms branding when on the home page

  const realmName = realmInfo?.mainnetName ?? realm?.info.name

  return (
    <div className="bg-bkg-1 flex h-20 items-center justify-between px-6">
      <div className="flex justify-start lg:w-0 lg:flex-1">
        <a href={`${realmInfo?.website}`}>
          {realmName && (
            <>
              <span className="sr-only">{realmName}</span>
              <img
                className="h-7"
                src={`/realms/${getResourceName(realmName)}/img/logo.svg`}
                alt={realmName}
                width="auto"
              />
            </>
          )}
        </a>
      </div>
      <ConnectWalletButton />
    </div>
  )
}

export default NavBar
