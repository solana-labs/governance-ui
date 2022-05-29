import { RadioGroup } from '@headlessui/react'
import Header from '@components/Header'
import Text from '@components/Text'

const NFTCollectionSelector = ({
  collections = {},
  metadata = {},
  onChange,
  value,
}) => {
  const optionClass =
    'z-0 flex items-center space-x-8 py-4 px-8 relative w-full transition-all duration-300 rounded-md hover:cursor-pointer disabled:cursor-not-allowed opacity-[84] disabled:opacity-50 hover:opacity-100 hover:bg-black'
  const selectedOptionClass = 'bg-black'

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
          const totalNfts = collection.length
          const images = collection.slice(0, 2).map((nft) => nft.data.image)

          for (let i = images.length; i < 3; i++) {
            images.push('')
          }

          return (
            <RadioGroup.Option value={key} key={key}>
              {({ active, checked }) => (
                <div
                  className={`${optionClass} ${
                    active || checked ? selectedOptionClass : ''
                  }`}
                >
                  <div className="">
                    <img
                      src={metadata[key]?.image}
                      className="w-20 h-20 border border-gray-700 rounded-full"
                      alt="Collection icon"
                    />
                  </div>
                  <div className="flex flex-col grow">
                    <Text>{metadata[key]?.name}</Text>
                    <Text level="2" className="text-white/50">
                      {totalNfts} {`NFT${totalNfts === 1 ? '' : 's'}`}
                    </Text>
                  </div>
                  <div className="flex space-x-4">
                    {images.map((src, index) => {
                      return (
                        <div
                          key={index}
                          className={`h-16 w-16 rounded-md ${
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
                  <div
                    className={`h-8 w-8 rounded-full ${
                      checked
                        ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
                        : 'border border-white/50 hover:border-white'
                    }
                    ${active ? 'border-white' : ''}`}
                  ></div>
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
