const TopBar = () => {
  return (
    <nav className={`bg-bkg-1`}>
      <div className={`px-4 sm:px-6 lg:px-8`}>
        <div className={`flex justify-between h-16`}>
          <div className={`flex`}>
            <div className={`flex-shrink-0 flex items-center`}>
              <img className={`h-8 w-auto`} src="/logo.svg" alt="logo" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default TopBar
