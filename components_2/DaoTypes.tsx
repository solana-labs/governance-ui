const DaoTypes = () => {
  return (
    <div className="bg-bkg-12 pt-24 pb-16 px-56">
      <div>
        <h1 className="md:text-3xl font-thin text-center">
          What types of DAOs can you create?
        </h1>
      </div>
      <div className="flex gap-8">
        <div>
          <img
            src="/img/realms-web/backgrounds/vr.svg"
            className="absolute"
            alt=""
          />
          <img
            src="/img/realms-web/icons/multisig.svg"
            className="my-2 h-8"
            alt=""
          />
          <h2>Multi-Signature DAO</h2>
          <p>
            A “multisig” DAO is simply a shared wallet which requires two or
            more of its members to authorize a transaction. This can be a more
            secure way for groups to store and access funds, since it reduces
            the dependency on a single person.
          </p>
          <div className="flex">
            <div>
              <img
                src="/img/realms-web/icons/ukraine-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>Ukraine.Sol</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/socean-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>SOCEAN</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/sctf1-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>SCTF1</p>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <img
            src="/img/realms-web/backgrounds/vr.svg"
            className="absolute"
            alt=""
          />
          <img
            src="/img/realms-web/icons/protocol.svg"
            className="my-2 h-8"
            alt=""
          />
          <h2>Protocol DAO</h2>
          <p>
            Protocol DAOs help decentralized organizations determine how its
            treasury funds are used. This flat, transparent voting hierarchy
            allows anyone to participate in the decision-making of the
            organization.
          </p>
          <div className="flex">
            <div>
              <img
                src="/img/realms-web/icons/mango-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>MangoDAO</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/serum-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>Serum</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/metaplex-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>Metaplex Foundation</p>
            </div>
          </div>
        </div>
        <hr />
        <div>
          <img
            src="/img/realms-web/backgrounds/vr.svg"
            className="absolute"
            alt=""
          />
          <img
            src="/img/realms-web/icons/nft-community.svg"
            className="my-2 h-8"
            alt=""
          />
          <h2>NFT Community DAO</h2>
          <p>
            NFT Community DAOs leverage NFTs as membership, allow members to use
            NFTs as voting power to make investment decisions.
          </p>
          <div className="flex">
            <div>
              <img
                src="/img/realms-web/icons/cardinal-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>Cardinal</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/f-and-f-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>Friends and Family DAO</p>
            </div>
            <div>
              <img
                src="/img/realms-web/icons/monke-dao.svg"
                className="my-2 h-5"
                alt=""
              />
              <p>MonkeDAO</p>
            </div>
          </div>
        </div>
      </div>
      <hr />
      <div className="text-center pt-4">
        <p>Ready to begin your DAO journey?</p>
        <button className="border border-500 border-white p-4 m-4 text-xs font-medium">
          Create DAO
        </button>
      </div>
    </div>
  )
}

export default DaoTypes
