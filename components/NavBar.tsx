import ConnectWalletButton from './ConnectWalletButton'

const NavBar = () => {
  return (
    <div className="grid grid-cols-12">
      <div className="bg-bkg-1 col-span-12 xl:col-start-2 xl:col-span-10 flex h-20 items-center justify-end px-4">
        <ConnectWalletButton />
      </div>
    </div>
  )
}

export default NavBar
