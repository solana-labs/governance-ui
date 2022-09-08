import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'

import ConnectWalletButton from './ConnectWalletButton'
import NotificationsSwitch from './NotificationsSwitch'
import ThemeSwitch from './ThemeSwitch'

const NavBar = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  return (
    <div className="flex flex-col sm:grid sm:grid-cols-12 relative z-[2]">
      <div className="flex items-center justify-between h-20 col-span-12 px-4 xl:col-start-2 xl:col-span-10 md:px-8 xl:px-4">
        <Link href={fmtUrlWithCluster('/realms')}>
          <div className="flex cursor-pointer sm:items-center min-w-[36px]">
            <picture>
              <source
                srcSet="/img/logotype-realms-blue-white.svg"
                media="(min-width: 640px)"
              />
              <img src="/img/logo-realms.svg" className="w-8 h-8 md:w-24" />
            </picture>
          </div>
        </Link>
        <div className="flex items-center justify-end space-x-2 md:space-x-4">
          <ThemeSwitch />
          <NotificationsSwitch />
          <ConnectWalletButton />
        </div>
      </div>
    </div>
  )
}

export default NavBar
