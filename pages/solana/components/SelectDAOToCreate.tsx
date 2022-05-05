import Link from 'next/link'
import Button from '../../../components_2/Button'
import { DaoType } from '../../../components_2/DaoType'
import { DaoIcon } from '../../../components_2/DaoIcon'
import GradientTitle from '../../../components_2/GradientTitle'

const CreateDaoButton = ({ text, href }) => {
  return (
    <Link href={href}>
      <Button inverse>
        <div className="flex items-center">
          <div className="pr-2">{text}</div>
          <img
            src="/1-Landing-v2/icon-arrow-blue.png"
            className="w-6 h-6 starting-image"
            alt="arrow"
          />
          <img
            src="/1-Landing-v2/icon-arrow-black.png"
            className="w-6 h-6 hover-image"
            alt="arrow"
          />
        </div>
      </Button>
    </Link>
  )
}

export const ListOfDAOTypes = () => {
  return (
    <div className="flex flex-col justify-between space-y-4 md:flex-row md:space-y-0">
      <div className="flex flex-col w-full md:w-[30%]">
        <DaoType
          imgSrc="/1-Landing-v2/dao-type-medium-multisig.png"
          daoTheme="Multi-Signature DAO"
          text='A "multisig" DAO is a shared wallet, typically with two or more members authorizing transactions. This is a secure way for groups to store and access funds'
        />
        <div className="pb-6 md:pb-8 flex justify-center md:justify-between md:pr-6 w-full pt-4 space-x-8 md:space-x-0 md:pt-6 min-h-[125px]">
          <DaoIcon imgSrc="ukraine-dao" daoName="Ukraine.Sol" />
          <DaoIcon imgSrc="socean-dao" daoName="SOCEAN" />
          <div className="hidden xl:block">
            <DaoIcon imgSrc="sctf1-dao" daoName="SCTF1" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-end md:items-start grow">
          <CreateDaoButton
            text="Start Multi-Signature DAO"
            href="/solana/create_dao/multisig"
          />
        </div>
      </div>
      <div className="flex flex-col w-full md:w-[30%]">
        <DaoType
          imgSrc="/1-Landing-v2/dao-type-medium-nft.png"
          daoTheme="NFT Community DAO"
          text="NFT Community DAOs leverage NFTs as membership, giving holders of NFTs within specified collections voting power to make investment decisions."
        />
        <div className="pb-6 md:pb-8 flex justify-center md:justify-between md:pr-6 w-full pt-4 space-x-8 md:space-x-0 md:pt-6 min-h-[125px]">
          <DaoIcon imgSrc="cardinal-dao" daoName="Cardinall" />
          <DaoIcon imgSrc="serum-dao" daoName="Serum" />
          <div className="hidden xl:block">
            <DaoIcon imgSrc="monke-dao" daoName="MonkeDAO" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-end md:items-start grow">
          <CreateDaoButton
            text="Start NFT Community DAO"
            href="/solana/create_dao/nft"
          />
        </div>
      </div>
      <div className="flex flex-col w-full md:w-[30%]">
        <DaoType
          imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
          daoTheme="Governance Token DAO"
          text="Governance Token DAOs help orgs determine how its funds are used. This flat voting hierarchy allows anyone to participate in the decisions of the org."
        />
        <div className="pb-6 md:pb-8 flex justify-center md:justify-between md:pr-6 w-full pt-4 space-x-8 md:space-x-0 md:pt-6 min-h-[125px]">
          <DaoIcon imgSrc="mango-dao" daoName="MangoDAO" />
          <DaoIcon imgSrc="f-and-f-dao" daoName="Friends and Family DAO" />
          <div className="hidden xl:block">
            <DaoIcon imgSrc="metaplex-dao" daoName="Metaplex Foundation" />
          </div>
        </div>
        <div className="flex flex-col items-center justify-end md:items-start grow">
          <CreateDaoButton
            text="Start Gov Token DAO"
            href="/solana/create_dao/gov-token"
          />
        </div>
      </div>
    </div>
  )
}

const SelectDAOToCreate = () => {
  return (
    <div className="pt-16 pb-16 md:pt-24 md:pb-28">
      <div className="mb-4 text-center md:text-left">
        <GradientTitle>
          What types of DAOs <br /> would you like to create?
        </GradientTitle>
      </div>
      <ListOfDAOTypes />
    </div>
  )
}

export default SelectDAOToCreate
