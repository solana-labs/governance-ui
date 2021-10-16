import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  return (
    <div className="grid grid-cols-12 mb-3">
      <div className=" col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-between px-4">
        <div className="flex items-center">
          <img src="/img/logo.svg" className="h-10 mr-3" />
          <h1 className="text-lg">Sierra</h1>
        </div>
        <ConnectWalletButton />
      </div>
    </div>
  )
}

export default NavBar
