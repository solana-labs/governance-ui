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
    'z-0 flex flex-wrap md:items-center md:space-x-8 flex-wrap py-4 px-2 md:px-8 relative w-full default-transition rounded-md hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-100 hover:bg-black'

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
          const images = collection.slice(0, 2).map((nft) => nft.image)

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
                      src={metadata[key]?.image}
                      className="w-16 h-16 border border-gray-700 rounded-full md:w-20 md:h-20"
                      alt="Collection icon"
                    />
                  </div>
                  <div className="flex flex-col mx-4 grow w-min md:mx-0">
                    <Text>{metadata[key]?.name}</Text>
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
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-black border ${
                      checked
                        ? 'bg-gradient-to-r from-[#00C2FF] via-[#00E4FF] to-[#87F2FF]'
                        : ''
                    }
                    ${active ? 'border-white text-white' : 'border-white/30'}`}
                  >
                    {checked && (
                      <svg
                        width="16"
                        height="13"
                        viewBox="0 0 16 13"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M15.4142 3.41421L6 12.8284L0.585785 7.41421L3.41421 4.58579L6 7.17157L12.5858 0.585785L15.4142 3.41421Z"
                          fill="currentColor"
                        />
                      </svg>
                    )}
                  </div>
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
