import useQueryContext from '@hooks/useQueryContext'
import Link from 'next/link'

import ConnectWalletButton from './ConnectWalletButton'
import NotificationsSwitch from './NotificationsSwitch'
import ThemeSwitch from './ThemeSwitch'

const NavBar = () => {
  const { fmtUrlWithCluster } = useQueryContext()

  return (
    <div className="grid grid-cols-12 mb-3">
      <div className="flex items-baseline justify-between h-20 col-span-12 px-4 pt-2 sm:pt-0 sm:items-center xl:col-start-2 xl:col-span-10 md:px-8 xl:px-4">
        <Link href={fmtUrlWithCluster('/realms')}>
          <div className="flex cursor-pointer sm:items-center min-w-[36px]">
            <img src="/img/logo-realms-blue.png" className="w-8 h-8" />
            <span className="hidden sm:block">Realms</span>
          </div>
        </Link>
        <div className="flex flex-wrap items-center justify-end space-y-2 sm:flex-row-reverse sm:space-y-0">
          <ConnectWalletButton />
          <div className="min-w-[33%] sm:min-w-fit sm:space-x-4 sm:mx-4 flex justify-between">
            <NotificationsSwitch />
            <ThemeSwitch />
          </div>
        </div>
      </div>
    </div>
  )
}

export default NavBar
