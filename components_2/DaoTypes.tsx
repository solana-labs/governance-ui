import Button from './Button'
import { DaoType } from './DaoType'
import { DaoIcon } from './DaoIcon'

const DaoTypes = () => {
  return (
    <div className="bg-bkg-12 pt-24 pb-16 px-56">
      <div>
        <h1 className="md:text-3xl font-thin text-center mb-16">
          What types of DAOs can you create?
        </h1>
      </div>
      <div className="flex justify-between">
        <div className="basis-1/3 px-6">
          <DaoType
            imgSrc="multisig"
            daoTheme="Multi-Signature DAO"
            text={`A “multisig” DAO is simply a shared wallet which requires two or
            more of its members to authorize a transaction. This can be a more
            secure way for groups to store and access funds, since it reduces
            the dependency on a single person.`}
          />
          <div className="grid grid-cols-3 gap-8 justify-items-center">
            <DaoIcon imgSrc="ukraine-dao" daoName="Ukraine.Sol" />
            <DaoIcon imgSrc="socean-dao" daoName="SOCEAN" />
            <DaoIcon imgSrc="sctf1-dao" daoName="SCTF1" />
          </div>
        </div>
        <div className="basis-1/3 px-6">
          <DaoType
            imgSrc="nft-community"
            daoTheme="NFT Community DAO"
            text="NFT Community DAOs leverage NFTs as membership, allow members to use
            NFTs as voting power to make investment decisions."
          />
          <div className="grid grid-cols-3 gap-8 justify-items-center">
            <DaoIcon imgSrc="cardinal-dao" daoName="Cardinall" />
            <DaoIcon imgSrc="f-and-f-dao" daoName="Friends and Family DAO" />
            <DaoIcon imgSrc="monke-dao" daoName="MonkeDAO" />
          </div>
        </div>
        <div className="basis-1/3 px-6">
          <DaoType
            imgSrc="govtoken"
            daoTheme="Governance Token DAO"
            text="Governance Token DAOs help orgs determine how its funds are used. This flat voting hierarchy allows anyone to participate in the decisions of the org."
          />
          <div className="grid grid-cols-3 gap-8 justify-items-center">
            <DaoIcon imgSrc="mango-dao" daoName="MangoDAO" />
            <DaoIcon imgSrc="serum-dao" daoName="Serum" />
            <DaoIcon imgSrc="metaplex-dao" daoName="Metaplex Foundation" />
          </div>
        </div>
      </div>
      <div className="text-center pt-4">
        <p>Ready to begin your DAO journey?</p>
        <Button className="m-5">Create DAO</Button>
      </div>
    </div>
  )
}

export default DaoTypes
