import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  return (
    <div className="bg-bkg-1 flex h-20 items-center justify-between px-6">
      <div className="flex justify-start lg:w-0 lg:flex-1">
        <a href="https://mango.markets">
          <span className="sr-only">Mango</span>
          <img className="h-7" src="/img/logo_mango.svg" alt="" width="auto" />
        </a>
      </div>
      <ConnectWalletButton />
    </div>
  )
}

export default NavBar
