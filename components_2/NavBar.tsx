import Button from './Button'

const NavBar = () => {
  return (
    <div className="bg-[#0B121B] bg-opacity-90 px-24 py-8 sticky top-0 z-50">
      {' '}
      {/*px-32 */}
      <div className="flex items-center">
        <div>
          <img src="/img/realms-web/icons/Realms-logo.svg" className="mr-2" />
        </div>
        <div className="flex-1">
          <a rel="noreferrer" href="" target="_blank">
            Realms
          </a>
        </div>
        <div className="ml-auto">
          <Button className="">Create DAO</Button>
        </div>
      </div>
    </div>
  )
}

export default NavBar
