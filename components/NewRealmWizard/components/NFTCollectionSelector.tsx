import { RadioGroup } from '@headlessui/react'
import Header from '@components/Header'
import Text from '@components/Text'
import GradientCheckmarkCircle from './GradientCheckmarkCircle'

const NFTCollectionSelector = ({ collections = {}, onChange, value }) => {
  const optionClass =
    'z-0 group flex flex-wrap md:items-center md:space-x-8 flex-wrap py-4 px-2 md:px-8 relative w-full default-transition rounded-md hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-100 hover:bg-black'

  if (Object.keys(collections).length === 0) {
    return (
      <Header as="h3">
        Your wallet does not contain any verified NFT collections to choose from
      </Header>
    )
  }

  return (
    <RadioGroup onChange={onChange} value={value}>
      <div className={`w-full space-y-3`}>
        {Object.keys(collections).map((key) => {
          const collection = collections[key]
          const totalNfts = collection.nfts.length
          const images = collection.nfts.slice(0, 2).map((nft) => nft.image)

          for (let i = images.length; i < 3; i++) {
            images.push('')
          }

          return (
            <RadioGroup.Option value={key} key={key}>
              {({ active, checked }) => (
                <div
                  className={`${optionClass} ${
                    active || checked ? 'bg-black' : ' bg-night-grey'
                  }`}
                >
                  <div className="">
                    <img
                      src={collection?.image}
                      className="w-16 h-16 border border-gray-700 rounded-full md:w-20 md:h-20"
                      alt="Collection icon"
                    />
                  </div>
                  <div className="flex flex-col mx-4 grow w-min md:mx-0">
                    <Text>{collection?.name}</Text>
                    <Text level="2" className="text-white/50">
                      {totalNfts} {`NFT${totalNfts === 1 ? '' : 's'}`}
                    </Text>
                  </div>
                  <div className="flex order-last mx-auto mt-2 space-x-2 md:mt-0 md:mx-0 md:space-x-4 md:order-none">
                    {images.map((src, index) => {
                      return (
                        <div
                          key={index}
                          className={`w-12 h-12 md:h-16 md:w-16 rounded-md ${
                            src ? '' : 'bg-bkg-grey'
                          } flex items-center`}
                        >
                          {src && (
                            <img
                              src={src}
                              alt={`NFT ${index + 1}`}
                              className="rounded-md"
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                  <GradientCheckmarkCircle selected={checked} />
                </div>
              )}
            </RadioGroup.Option>
          )
        })}
      </div>
    </RadioGroup>
  )
}

export default NFTCollectionSelector
