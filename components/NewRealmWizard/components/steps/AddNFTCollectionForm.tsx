import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import axios from 'axios'

import { updateUserInput, validateSolAddress } from '@utils/formValidation'
import { notify } from '@utils/notifications'
import { abbreviateAddress } from '@utils/formatting'

import useWalletStore from 'stores/useWalletStore'

// import { Dialog, Transition } from '@headlessui/react'
import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import { NewButton as Button } from '@components/Button'
import Input, {
  InputRangeSlider,
} from '@components/NewRealmWizard/components/Input'
// import Header from '../components_2/ProductHeader'
import Text from '@components/Text'
import NFTCollectionSelector from '@components/NewRealmWizard/components/NFTCollectionSelector'
import ThresholdAdviceBox from '@components/NewRealmWizard/components/ThresholdAdviceBox'

function filterAndMapVerifiedCollections(nfts) {
  return nfts
    .filter((nft) => {
      if (nft.data?.collection) {
        return nft.data?.collection?.verified
      } else {
        return nft.collection?.verified
      }
    })
    .map((nft) => {
      if (nft.data.collection) {
        return nft.data
      } else {
        return nft
      }
    })
    .reduce((prev, curr) => {
      const collectionKey = curr.collection?.key
      if (typeof collectionKey === 'undefined') return prev

      if (prev[collectionKey]) {
        prev[collectionKey].push(curr)
      } else {
        prev[collectionKey] = [curr]
      }
      return prev
    }, {})
}

async function enrichItemInfo(item, uri) {
  const { data: response } = await axios.get(uri)
  return {
    ...item,
    ...response,
  }
}

async function enrichCollectionInfo(connection, collectionKey) {
  const {
    data: { data: collectionData },
  } = await Metadata.findByMint(connection, collectionKey)

  return enrichItemInfo(collectionData, collectionData.uri)
}

async function getNFTCollectionInfo(connection, collectionKey) {
  const { data: result } = await Metadata.findByMint(connection, collectionKey)
  console.log('NFT findByMint result', result)
  if (result?.collection?.verified && result.collection?.key) {
    // here we were given a child of the collection (hence the "collection" property is present)
    const collectionInfo = await enrichCollectionInfo(
      connection,
      result.collection.key
    )
    const collectionMembers = await enrichItemInfo(result.data, result.data.uri)
    return { collectionInfo, collectionMembers: [collectionMembers] }
  } else {
    // assume we've been given the collection address already, so we need to go find it's children
    const children = await Metadata.findMany(connection, {
      updateAuthority: result.updateAuthority,
    })

    const verifiedCollections = filterAndMapVerifiedCollections(children)
    if (verifiedCollections[collectionKey]) {
      const collectionInfo = await enrichCollectionInfo(
        connection,
        collectionKey
      )
      const collectionMembers = await Promise.all(
        verifiedCollections[collectionKey].map((item) => {
          return enrichItemInfo(item.data, item.data.uri)
        })
      )
      return { collectionInfo, collectionMembers }
    } else {
      throw new Error(
        'Address did not return collection with children whose "collection.key" matched'
      )
    }
  }

  // 3iBYdnzA418tD2o7vm85jBeXgxbdUyXzX9Qfm2XJuKME
}

export const AddNFTCollectionSchema = {
  collectionKey: yup.string().required(),
  numberOfNFTs: yup
    .number()
    .min(1, 'Must be at least 1')
    .transform((value) => (isNaN(value) ? undefined : value))
    .required('Required'),
  communityYesVotePercentage: yup
    .number()
    .typeError('Required')
    .max(100, 'Approval cannot require more than 100% of votes')
    .min(1, 'Approval must be at least 1% of votes')
    .required('Required'),
}

export interface AddNFTCollection {
  collectionKey: string
  communityYesVotePercentage: number
  numberOfNFTs: number
}

export interface NFT_Creator {
  address: string
  verified: number
  share: number
}

interface NFT_Attributes {
  display_type: string
  trait_type: string
  value: number
}
export interface NFT {
  name: string
  symbol: string
  uri: string
  sellerFeeBasisPoints: number
  creators: NFT_Creator[]
  description: string
  seller_fee_basis_points: number
  image: string
  animation_url: string
  external_url: string
  attributes: NFT_Attributes[]
  collection: any
  properties: any
}

function WalletIcon() {
  return (
    <svg
      width="16"
      height="15"
      viewBox="0 0 16 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 4.5C16 3.94772 15.5513 3.5 14.9979 3.5H14.2463C14.108 3.5 13.9958 3.38807 13.9958 3.25V1C13.9958 0.447715 13.5471 0 12.9937 0H2.00422C0.884255 0 -0.0183791 0.915877 0.000284295 2.03333L0.184003 13.0333C0.202232 14.1248 1.09406 15 2.18794 15H14.9979C15.5513 15 16 14.5523 16 14V4.5ZM0.968429 2.25C0.968429 1.56055 1.52918 1 2.22106 1H12.7432C12.8816 1 12.9937 1.11133 12.9937 1.25V3.25C12.9937 3.38807 12.8815 3.5 12.7432 3.5H2.22106C1.52918 3.5 0.968429 2.93945 0.968429 2.25ZM13.2447 10.5C13.9365 10.5 14.4973 9.94036 14.4973 9.25C14.4973 8.55964 13.9365 8 13.2447 8C12.5529 8 11.9921 8.55964 11.9921 9.25C11.9921 9.94036 12.5529 10.5 13.2447 10.5Z"
        fill="currentColor"
      />
    </svg>
  )
}

function SkeletonNFTCollectionInfo({ loading = false }) {
  return (
    <>
      <img
        src="/img/nft-collection-placeholder.png"
        className={`w-24 h-24 ${loading ? 'animate-pulse' : ''}`}
      />
      <div className={`space-y-2 truncate ${loading ? 'animate-pulse' : ''}`}>
        <div className="text-transparent truncate rounded w-fit bg-bkg-grey">
          Collection name...
        </div>
        <div className="text-transparent truncate rounded w-fit bg-bkg-grey">
          Loading-long-url-to-some-obscure-wallet-address
        </div>
        <div className="text-transparent truncate rounded w-fit bg-bkg-grey">
          xx 1234...6789
        </div>
      </div>
    </>
  )
}

export default function AddNFTCollectionForm({
  type,
  formData,
  currentStep,
  totalSteps,
  onSubmit,
  onPrevClick,
}) {
  const { connected, connection, current: wallet } = useWalletStore((s) => s)
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  // const [modalOpen, setModalOpen] = useState(true)
  const [collectionMetadata, setCollectionMetadata] = useState({})
  const [collectionMembers, setCollectionMembers] = useState<NFT[]>([])
  const [collectionsAvailable, setCollectionsAvailable] = useState({})
  const [selectedNFTCollection, setSelectedNFTCollection] = useState('')
  const schema = yup.object(AddNFTCollectionSchema).required()
  const {
    control,
    register,
    watch,
    getValues,
    setValue,
    setError,
    setFocus,
    clearErrors,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })

  const numberOfNFTs = watch('numberOfNFTs') || 10000
  const approvalPercent = watch('communityYesVotePercentage', 60)
  const approvalSize = approvalPercent
    ? Math.ceil((Number(numberOfNFTs) * approvalPercent) / 100)
    : undefined

  useEffect(() => {
    updateUserInput(formData, AddNFTCollectionSchema, setValue)
    setValue('collectionKey', formData?.collectionKey)
    setSelectedNFTCollection(formData?.collectionKey)
    setCollectionMetadata(formData?.collectionMetadata)
  }, [])

  useEffect(() => {
    if (!selectedNFTCollection) {
      setFocus('addressInput')
    } else {
      setFocus('numberOfNFTs')
    }
  }, [selectedNFTCollection])

  function serializeValues(values) {
    const data = {
      numberOfNFTs: null,
      ...values,
      addressInput: null,
      collectionMetadata,
    }
    onSubmit({ step: currentStep, data })
  }

  async function handleAdd() {
    clearErrors()
    setSelectedNFTCollection('')
    setCollectionMetadata({})
    setCollectionMembers([])
    const addressInput = getValues('addressInput')
    const isValidAddress = validateSolAddress(addressInput)

    if (isValidAddress) {
      setRequestPending(true)
      try {
        const {
          collectionInfo,
          collectionMembers,
        } = await getNFTCollectionInfo(connection.current, addressInput)
        console.log('NFT collection info:', collectionInfo)
        setValue('collectionKey', addressInput)
        setSelectedNFTCollection(addressInput)
        setCollectionMetadata({ [addressInput]: collectionInfo })
        setCollectionMembers(collectionMembers)
        setRequestPending(false)
      } catch (err) {
        setRequestPending(false)
        setError(
          'addressInput',
          { type: 'custom', message: 'Address is not a verified collection' },
          { shouldFocus: true }
        )
      }
    }
  }

  async function handleSelectFromWallet() {
    try {
      setWalletConnecting(true)

      if (!connected) {
        if (wallet) await wallet.connect()
      }
      if (!wallet?.publicKey) {
        throw new Error('No valid wallet connected')
      }

      const ownedNfts = await Metadata.findDataByOwner(
        connection.current,
        wallet.publicKey
      )
      console.log('NFT wallet contents', ownedNfts)
      const verifiedCollections = filterAndMapVerifiedCollections(ownedNfts)
      console.log('NFT verified collections', verifiedCollections)

      const collectionMetadata = {}
      for (const collectionKey in verifiedCollections) {
        collectionMetadata[collectionKey] = await enrichCollectionInfo(
          connection.current,
          collectionKey
        )

        const nfts = await Promise.all(
          verifiedCollections[collectionKey].slice(0, 2).map((nft) => {
            return enrichItemInfo(nft.data, nft.data.uri)
          })
        )
        verifiedCollections[collectionKey] = nfts
      }

      console.log(collectionMetadata, verifiedCollections)
      setCollectionMetadata(collectionMetadata)
      setCollectionsAvailable(verifiedCollections)
      // setModalOpen(true)
      setWalletConnecting(false)
    } catch (error) {
      setWalletConnecting(false)
      const err = error as Error
      console.log(error)
      return notify({
        type: 'error',
        message: err.message,
      })
    }
  }

  // function closeModal() {
  //   setModalOpen(false)
  // }

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="approval-threshold-form"
    >
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="add a collection"
        title="Which NFT collection would you like to add to your DAO?"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <Controller
          name="addressInput"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormField
              title="What is the collection URL or Address?"
              description=""
            >
              <Input
                placeholder="e.g. SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND"
                data-testid="nft-address"
                error={errors.addressInput?.message || ''}
                {...field}
                disabled={requestPending}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter') {
                    handleAdd()
                  }
                }}
              />
              <div className="flex flex-col items-center justify-between space-y-4 md:space-y-0 md:flex-row-reverse">
                <Button
                  type="submit"
                  onClick={handleAdd}
                  loading={requestPending}
                  disabled={!field.value || requestPending}
                  className="w-full md:w-fit"
                >
                  + Add
                </Button>
                <Button
                  type="button"
                  secondary
                  loading={walletConnecting}
                  onClick={handleSelectFromWallet}
                  className="w-full md:w-fit"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <WalletIcon />
                    <span>Select from Wallet</span>
                  </div>
                </Button>
              </div>
            </FormField>
          )}
        />
        <input className="hidden" {...register('collectionKey')} disabled />
        <div className="flex space-x-2">
          <div className="flex flex-col w-full px-4 py-5 rounded-md bg-night-grey grow">
            <Text level="2">
              {selectedNFTCollection
                ? 'Collection preview'
                : 'Add a collection or select one from your wallet...'}
            </Text>
            <div className="flex mt-5 space-x-2">
              {!selectedNFTCollection ? (
                <SkeletonNFTCollectionInfo loading={requestPending} />
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="relative h-24 w-28">
                    {collectionMembers.slice(0, 3).map((nft, index) => {
                      return (
                        <img
                          key={nft.name}
                          src={nft.image}
                          alt="collection item"
                          className={`absolute w-24 h-24 rounded-md ${
                            index === 0
                              ? 'rotate-[-9deg]'
                              : index === 1
                              ? 'rotate-[-15deg]'
                              : index === 2
                              ? 'rotate-[15deg]'
                              : 'rotate-[9deg]'
                          }`}
                        />
                      )
                    })}
                    <img
                      src={collectionMetadata[selectedNFTCollection]?.image}
                      className="absolute w-24 h-24 rounded-md"
                    />
                  </div>
                  <div className="truncate">
                    <Text level="1" className="">
                      {collectionMetadata[selectedNFTCollection]?.name ||
                        '(Collection has no name)'}
                    </Text>
                    <Text level="2" className="text-white/70">
                      {collectionMetadata[selectedNFTCollection]
                        ?.external_url ? (
                        <a
                          href={
                            collectionMetadata[selectedNFTCollection]
                              .external_url
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {
                            collectionMetadata[selectedNFTCollection]
                              .external_url
                          }
                        </a>
                      ) : (
                        '(Collection has no external address)'
                      )}
                    </Text>
                    <Text
                      level="2"
                      className="flex items-baseline mt-2 space-x-2 text-white/50"
                    >
                      <WalletIcon />
                      <span>{abbreviateAddress(selectedNFTCollection)}</span>
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center px-8 pt-5 text-center rounded-md bg-night-grey">
            <Controller
              name="numberOfNFTs"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <div className="flex flex-col justify-between h-full">
                  <Text level="2">How many NFTs are in this collection?</Text>
                  <Input
                    Icon={
                      <svg
                        width="18"
                        height="16"
                        viewBox="0 0 18 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M9.2824 0.181642C8.58511 -0.335268 7.62238 0.333984 7.89166 1.14843L8.47636 2.91687C8.14048 3.1382 7.74895 3.46833 7.40679 3.88406L0.625238 2.08288C0.382319 2.01836 0.12857 2.14235 0.0353253 2.37113C-0.0579197 2.59991 0.0389839 2.86074 0.260606 2.97752L6.47029 6.24939C6.13488 7.99973 5.6718 9.37245 5.30243 10.3718C5.09794 10.9251 5.49701 11.5199 6.10351 11.5469L7.19064 11.5952C7.73549 11.6195 8.2373 11.3066 8.44496 10.8131L8.65225 10.3205C8.73116 10.1329 8.93781 9.99545 9.19724 9.99561C9.8825 9.99604 10.7781 9.89752 11.5092 9.37501C11.8793 9.11054 12.1839 8.75505 12.3993 8.29341C12.5769 8.37294 12.7743 8.48255 12.9458 8.61806C13.2247 8.83849 13.3598 9.06384 13.3598 9.28237C13.3598 9.69164 13.1547 10.0635 12.7361 10.4749C12.3838 10.8212 11.9335 11.1461 11.4235 11.514C11.3128 11.594 11.1991 11.676 11.0832 11.7606C9.83719 12.6697 8.36513 13.8487 8.22732 15.8596L17.9999 16L18 4.07516C17.2988 3.46346 16.5566 2.902 15.5665 2.48838C14.5769 2.07496 13.3696 1.82135 11.7456 1.77939C11.5377 1.77402 11.3427 1.70894 11.1882 1.59442L9.2824 0.181642Z"
                          fill="currentColor"
                        />
                      </svg>
                    }
                    type="tel"
                    placeholder="10,000"
                    data-testid="nft-collection-count"
                    error={error?.message || ''}
                    disabled={!selectedNFTCollection}
                    {...field}
                  />
                </div>
              )}
            />
          </div>
        </div>
        <Controller
          name="communityYesVotePercentage"
          control={control}
          defaultValue={60}
          render={({ field, fieldState: { error } }) => (
            <FormField
              title="Adjust how much of the total NFT supply is needed to pass a proposal"
              description=""
              disabled={!selectedNFTCollection}
            >
              <InputRangeSlider
                field={field}
                error={error?.message}
                placeholder="60"
                disabled={!selectedNFTCollection}
              />
            </FormField>
          )}
        />
      </div>

      <NFTCollectionSelector
        collections={collectionsAvailable}
        metadata={collectionMetadata}
        onChange={(val) => {
          setSelectedNFTCollection(val)
          setValue('collectionKey', val)
        }}
        value={selectedNFTCollection}
      />

      <ThresholdAdviceBox title="Approval threshold">
        {approvalPercent > 0 ? (
          <>
            <div className="text-lg">
              With {numberOfNFTs.toLocaleString()} NFTs in your DAO
            </div>
            <div className="pt-2 text-lg">
              {approvalSize?.toLocaleString()} worth of NFTs would need to
              approve a proposal for it to pass.
            </div>
          </>
        ) : (
          <div
            className="text-[22px] font-bold opacity-20"
            dangerouslySetInnerHTML={{
              __html: `&#8212;&#8212;&#8212;`,
            }}
          ></div>
        )}
      </ThresholdAdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
