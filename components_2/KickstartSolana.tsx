import Button, { PopUpButton, ExploreButton } from './Button'

const KickstartSolana = () => {
  return (
    <div className="bg-cover bg-hero-graphic pt-10 pb-16 px-56">
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
          <div className="flex items-center">
            <button
              type="button"
              className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Default
            </button>
            <button className="relative inline-flex items-center justify-center p-0.5 mb-2 mr-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white focus:ring-4 focus:outline-none focus:ring-blue-300 dark:focus:ring-blue-800">
              <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-opacity-0">
                Purple to blue
              </span>
            </button>
            <PopUpButton className="mr-4">Read the Docs</PopUpButton>

            <ExploreButton className="border border-gradient-to-r-blue-red">
              Explore DAOs
            </ExploreButton>
          </div>
        </div>
      </div>
      <div className="text-center mt-28">
        <h1 className="md:text-6xl font-thin tracking-tight">Kickstart your</h1>
        <h1 className="md:text-6xl font-thin tracking-tight">
          community on Solana
        </h1>
        <p className="mt-4 text-base opacity-70 tracking-tight">
          Create and participate in fully on-chain DAOs of all kinds.
        </p>
      </div>
      <div className="text-center py-4">
        <Button className="m-4">Create DAO</Button>
      </div>
    </div>
  )
}

export default KickstartSolana
