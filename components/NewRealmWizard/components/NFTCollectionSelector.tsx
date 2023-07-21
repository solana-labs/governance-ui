import { ImgHTMLAttributes, useState } from 'react'
import { RadioGroup } from '@headlessui/react'
import Header from '@components/Header'
import Text from '@components/Text'
import GradientCheckmarkCircle from './GradientCheckmarkCircle'
import { LoadingDots } from '@components/Loading'

function ImageWithLoader({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
  const [loading, setLoading] = useState(true)
  const loadingClassName = `${loading ? '' : 'hidden'} ${className}`
  const imageClassName = `${loading ? 'hidden' : ''} ${className}`
  return (
    <>
      <div className={loadingClassName}>
        <LoadingDots />
      </div>
      <img
        {...props}
        src={props.src}
        className={imageClassName}
        onLoad={() => setLoading(false)}
      />
    </>
  )
}

const NFTCollectionSelector = ({ collections = {}, onChange, value }) => {
  const optionClass =
    'z-0 group flex flex-wrap md:items-center md:space-x-8 flex-wrap py-4 px-2 md:px-8 relative w-full default-transition rounded-md hover:cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 hover:opacity-100 hover:bg-bkg-3'

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
          const totalNfts = collection.totalNfts
          const images = collection.nfts.slice(0, 2).map((nft) => nft.image)

          for (let i = images.length; i < 3; i++) {
            images.unshift('')
          }

          return (
            <RadioGroup.Option value={key} key={key}>
              {({ active, checked }) => (
                <div
                  className={`${optionClass} ${
                    active || checked ? 'bg-bkg-1' : ' bg-bkg-3'
                  }`}
                >
                  <div className="">
                    <ImageWithLoader
                      src={collection?.image || ''}
                      className="flex justify-center w-16 h-16 border rounded-full border-fgd-4 md:w-20 md:h-20"
                      alt="Collection icon"
                    />
                  </div>
                  <div className="flex flex-col mx-4 grow w-min md:mx-0">
                    <Text>{collection?.name}</Text>
                    <Text level="2" className="text-fgd-2">
                      {totalNfts} {`NFT${totalNfts === 1 ? '' : 's'}`}
                    </Text>
                  </div>
                  <div className="grid order-last grid-cols-3 gap-2 mx-auto mt-2 md:gap-3 md:mt-0 md:mx-0 md:order-none">
                    {images.map((src, index) => {
                      return (
                        <div key={index}>
                          {src && (
                            <ImageWithLoader
                              src={src || ''}
                              alt={`NFT ${index + 1}`}
                              className="flex justify-center w-12 h-12 rounded-md md:h-16 md:w-16 bg-bkg-2"
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
