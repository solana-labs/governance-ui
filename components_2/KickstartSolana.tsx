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
