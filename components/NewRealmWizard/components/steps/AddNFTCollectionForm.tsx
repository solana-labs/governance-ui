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
import Input from '@components/NewRealmWizard/components/Input'
// import Header from '../components_2/ProductHeader'
import Text from '@components/Text'
import NFTCollectionSelector from '@components/NewRealmWizard/components/NFTCollectionSelector'

import ThresholdAdviceBox from '@components/NewRealmWizard/components/ThresholdAdviceBox'

async function getNFTCollectionInfo(connection, collectionKey) {
  const {
    data: { data: collectionData },
  } = await Metadata.findByMint(connection, collectionKey)

  const { data: response } = await axios.get(collectionData.uri)
  return {
    ...collectionData,
    ...response,
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
      setValue('communityYesVotePercentage', 0, { shouldValidate: false })
    } else {
      setValue('communityYesVotePercentage', 60, { shouldValidate: true })
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
    const addressInput = getValues('addressInput')
    const isValidAddress = validateSolAddress(addressInput)

    if (isValidAddress) {
      setRequestPending(true)
      try {
        const collectionInfo = await getNFTCollectionInfo(
          connection.current,
          addressInput
        )
        console.log(collectionInfo)
        setValue('collectionKey', addressInput)
        setSelectedNFTCollection(addressInput)
        setCollectionMetadata({ [addressInput]: collectionInfo })
        setRequestPending(false)
      } catch (err) {
        setRequestPending(false)
        setError(
          'addressInput',
          { type: 'custom', message: 'Verified collection not found' },
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
      const verifiedCollections = ownedNfts
        .filter((nft) => nft.collection?.verified && nft.collection?.key)
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

      const collectionMetadata = {}
      for (const collectionKey in verifiedCollections) {
        const {
          data: { data: collectionData },
        } = await Metadata.findByMint(connection.current, collectionKey)
        const { data: response } = await axios.get(collectionData.uri)
        collectionMetadata[collectionKey] = {
          ...collectionData,
          ...response,
        }
        const nfts = verifiedCollections[collectionKey].slice(0, 2)
        for (let i = 0; i < nfts.length; i++) {
          const { data: response } = await axios.get(nfts[i].data.uri)
          nfts[i].data = {
            ...nfts[i].data,
            ...response,
          }
        }
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
                  disabled={!field.value}
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
                <>
                  <img
                    src="/1-Landing-v2/avatar-nft.png"
                    className={`w-24 h-24 ${
                      requestPending ? 'animate-pulse' : ''
                    }`}
                  />
                  <div
                    className={`space-y-2 truncate ${
                      requestPending ? 'animate-pulse' : ''
                    }`}
                  >
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
              ) : (
                <div className="flex items-center space-x-2">
                  <div>
                    <img
                      src={collectionMetadata[selectedNFTCollection]?.image}
                      className="w-24 h-24 rounded-md"
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
                        width="16"
                        height="16"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="20" height="20" rx="1" fill="black" />
                        <path
                          d="M10.2824 3.18164C9.58511 2.66473 8.62238 3.33398 8.89166 4.14843L9.47636 5.91687C9.14048 6.1382 8.74895 6.46833 8.40679 6.88406L1.62524 5.08288C1.38232 5.01836 1.12857 5.14235 1.03533 5.37113C0.94208 5.59991 1.03898 5.86074 1.26061 5.97752L7.47029 9.24939C7.13488 10.9997 6.6718 12.3724 6.30243 13.3718C6.09794 13.9251 6.49701 14.5199 7.10351 14.5469L8.19064 14.5952C8.73549 14.6195 9.2373 14.3066 9.44496 13.8131L9.65225 13.3205C9.73116 13.1329 9.93781 12.9955 10.1972 12.9956C10.8825 12.996 11.7781 12.8975 12.5092 12.375C12.8793 12.1105 13.1839 11.755 13.3993 11.2934C13.5769 11.3729 13.7743 11.4826 13.9458 11.6181C14.2247 11.8385 14.3598 12.0638 14.3598 12.2824C14.3598 12.6916 14.1547 13.0635 13.7361 13.4749C13.3838 13.8212 12.9335 14.1461 12.4235 14.514C12.3128 14.594 12.1991 14.676 12.0832 14.7606C10.8372 15.6697 9.36513 16.8487 9.22732 18.8596L18.9999 19L19 7.07516C18.2988 6.46346 17.5566 5.902 16.5665 5.48838C15.5769 5.07496 14.3696 4.82135 12.7456 4.77939C12.5377 4.77402 12.3427 4.70894 12.1882 4.59442L10.2824 3.18164Z"
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
          render={({ field }) => (
            <FormField
              title="Adjust how much of the total NFT supply is needed to pass a proposal"
              description=""
              disabled={!selectedNFTCollection}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-[4.5rem]">
                    <Input
                      type="number"
                      placeholder="60"
                      data-testid="dao-quorum-input"
                      error={errors.communityYesVotePercentage?.message || ''}
                      disabled={!selectedNFTCollection}
                      {...field}
                    />
                  </div>
                  <div className="text-3xl opacity-30">%</div>
                </div>
                <div className="relative flex items-center w-full ml-4 space-x-4">
                  <div className="opacity-60">1%</div>
                  <input
                    type="range"
                    min={1}
                    className="w-full with-gradient focus:outline-none focus:ring-0 focus:shadow-none"
                    {...field}
                    style={{
                      backgroundSize: `${approvalPercent}% 100%`,
                    }}
                  />
                  <div className="opacity-60">100%</div>
                </div>
              </div>
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
