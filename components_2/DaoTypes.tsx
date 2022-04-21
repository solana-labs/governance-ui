import Button from './Button'

const DaoTypes = () => {
  return (
    <div className="bg-bkg-12 pt-24 pb-16 px-56">
      <div>
        <h1 className="md:text-3xl font-thin text-center mb-12">
          What types of DAOs can you create?
        </h1>
      </div>
      <div className="flex justify-between">
        <img src="/img/realms-web/backgrounds/vr.svg" className="" alt="" />
        <div className="basis-1/3 px-6">
          <img
            src="/img/realms-web/icons/multisig.svg"
            className="mb-8 h-12"
            alt=""
          />
          <h2>Multi-Signature DAO</h2>
          <p className="opacity-70">
            A “multisig” DAO is simply a shared wallet which requires two or
            more of its members to authorize a transaction. This can be a more
            secure way for groups to store and access funds, since it reduces
            the dependency on a single person.
          </p>
          <div className="flex justify-between px-8">
            <div className="flex flex-col">
              {/* flex flex-col items-center justify-center */}
              <img
                src="/img/realms-web/icons/ukraine-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="text-xs opacity-70">Ukraine.Sol</p>
            </div>
            <div className="flex flex-col">
              <img
                src="/img/realms-web/icons/socean-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="text-xs opacity-70">SOCEAN</p>
            </div>
            <div className="flex flex-col">
              <img
                src="/img/realms-web/icons/sctf1-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="text-xs opacity-70">SCTF1</p>
            </div>
          </div>
        </div>
        <img src="/img/realms-web/backgrounds/vr.svg" className="" alt="" />
        <div className="basis-1/3 px-6">
          <img
            src="/img/realms-web/icons/protocol.svg"
            className="mb-8 h-12"
            alt=""
          />
          <h2>Protocol DAO</h2>
          <p className="opacity-70">
            Protocol DAOs help decentralized organizations determine how its
            treasury funds are used. This flat, transparent voting hierarchy
            allows anyone to participate in the decision-making of the
            organization.
          </p>
          <div className="flex justify-between px-8">
            <div className="basis-1/3">
              <img
                src="/img/realms-web/icons/mango-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="text-xs opacity-70">MangoDAO</p>
            </div>
            <div className="basis-1/3">
              <img
                src="/img/realms-web/icons/serum-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="text-xs opacity-70">Serum</p>
            </div>
            <div className="basis-1/3">
              <img
                src="/img/realms-web/icons/metaplex-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="text-xs opacity-70">Metaplex Foundation</p>
            </div>
          </div>
        </div>
        <img src="/img/realms-web/backgrounds/vr.svg" className="" alt="" />
        <div className="basis-1/3 px-6">
          <img
            src="/img/realms-web/icons/nft-community.svg"
            className="mb-8 h-12"
            alt=""
          />
          <h2>NFT Community DAO</h2>
          <p className="opacity-70">
            NFT Community DAOs leverage NFTs as membership, allow members to use
            NFTs as voting power to make investment decisions.
          </p>
          <div className="grid grid-cols-3 justify-items-center">
            {/* justify-center content-center */}
            <div className="justify-center">
              <img
                src="/img/realms-web/icons/cardinal-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="opacity-70 text-xs">Cardinal</p>
            </div>
            <div className="items-center">
              <img
                src="/img/realms-web/icons/f-and-f-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="opacity-70 text-xs">Friends and Family DAO</p>
            </div>
            <div className="items-center">
              <img
                src="/img/realms-web/icons/monke-dao.svg"
                className="my-4 h-7"
                alt=""
              />
              <p className="opacity-70 text-xs">MonkeDAO</p>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="text-center pt-4">
        <p>Ready to begin your DAO journey?</p>
        <Button className="m-4">Create DAO</Button>
      </div>
    </div>
  )
}

export default DaoTypes
