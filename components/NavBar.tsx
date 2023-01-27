import Link from 'next/link'
import dynamic from 'next/dynamic'
import NotificationsSwitch from './NotificationsSwitch'
import ThemeSwitch from './ThemeSwitch'

const ConnectWalletButtonDynamic = dynamic(
  async () => await import('./ConnectWalletButton'),
  { ssr: false }
)

const NavBar = () => {


  return (
    <div className="flex flex-col sm:grid sm:grid-cols-12 relative z-20">
      <div className="flex items-center justify-between h-20 col-span-12 px-4 xl:col-start-2 xl:col-span-10 md:px-8 xl:px-4">
        <Link href="hadeswap.com">
          <div className="flex cursor-pointer sm:items-center min-w-[36px]">
            <picture>
              <img src="/img/hadeswap_full_logo.png" className="md:h-8" />
            </picture>
          </div>
        </Link>
        <div className="flex items-center justify-end space-x-2 md:space-x-4">
          <ThemeSwitch />
          <NotificationsSwitch />
          <ConnectWalletButtonDynamic />
        </div>
      </div>
    </div>
  )
}

export default NavBar
