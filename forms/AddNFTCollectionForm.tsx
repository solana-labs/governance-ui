import React, { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import axios from 'axios'

import { updateUserInput, validateSolAddress } from '../utils/formValidation'
import { notify } from '@utils/notifications'
import { abbreviateAddress } from '@utils/formatting'

import useWalletStore from 'stores/useWalletStore'

// import { Dialog, Transition } from '@headlessui/react'
import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import Button from '../components_2/Button'
import Input from '../components_2/Input'
// import Header from '../components_2/Header'
import Text from '../components_2/Text'
import NFTCollectionSelector from 'components_2/NFTCollectionSelector'

import { ThresholdAdviceBox } from './MemberQuorumThresholdForm'

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
    .positive('Must be greater than 0')
    .transform((value) => (isNaN(value) ? undefined : value)),
  approvalThreshold: yup
    .number()
    .typeError('Required')
    .max(100, 'Approval cannot require more than 100% of votes')
    .min(1, 'Approval must be at least 1% of votes')
    .required('Required'),
}

export interface AddNFTCollection {
  collectionKey: string
  approvalThreshold: number
  numberOfNFTs?: number
}

export default function AddNFTCollectionForm({
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

  const numberOfNFTs = watch('numberOfNFTs', '') || 10000
  const approvalPercent = watch('approvalThreshold', 60)
  const approvalSize = approvalPercent
    ? Math.ceil((Number(numberOfNFTs) * approvalPercent) / 100)
    : undefined

  console.log(collectionMetadata[selectedNFTCollection])

  useEffect(() => {
    updateUserInput(formData, AddNFTCollectionSchema, setValue)
    setValue('collectionKey', formData?.collectionKey)
    setSelectedNFTCollection(formData?.collectionKey)
    setCollectionMetadata(formData?.collectionMetadata)
  }, [])

  useEffect(() => {
    if (!selectedNFTCollection) {
      setValue('approvalThreshold', 0, { shouldValidate: false })
      setValue('numberOfNFTs', '', { shouldValidate: false })
    } else {
      setValue('approvalThreshold', 60, { shouldValidate: true })
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
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepDescription="Add a collection"
        title="Which NFT collection would you like to add to your DAO?"
        imgSrc="/1-Landing-v2/dao-type-medium-govtoken.png"
        imgAlt="circles spirling"
      />
      <div className="pt-10 space-y-10 md:space-y-12">
        <Controller
          name="addressInput"
          control={control}
          defaultValue=""
          render={({ field }) => (
            <FormField
              title="What is the collection URL or Address?"
              description="" //"It's best to choose a descriptive, memorable name for you and your members."
            >
              <Input
                placeholder="e.g. SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND"
                data-testid="nft-address"
                error={errors.addressInput?.message || ''}
                {...field}
              />
              <Button
                type="button"
                secondary
                onClick={handleAdd}
                isLoading={requestPending}
              >
                + Add
              </Button>
              <Button
                type="button"
                withBorder
                isLoading={walletConnecting}
                onClick={handleSelectFromWallet}
              >
                Select from Wallet
              </Button>
            </FormField>
          )}
        />
        <input className="hidden" {...register('collectionKey')} disabled />
        <div className="flex space-x-2">
          <div className="flex bg-[#201F27] flex-col px-4 py-5 rounded-md w-full grow">
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
                    <div className="w-fit bg-[#292833] text-transparent truncate rounded">
                      Collection name...
                    </div>
                    <div className="w-fit bg-[#292833] text-transparent truncate rounded">
                      Loading-long-url-to-some-obscure-wallet-address
                    </div>
                    <div className="w-fit bg-[#292833] text-transparent truncate rounded">
                      xx 1234...6789
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <div>
                    <img
                      src={collectionMetadata[selectedNFTCollection]?.image}
                      className="w-24 h-24"
                    />
                  </div>
                  <div className="space-y-2 truncate">
                    <div className="">
                      {collectionMetadata[selectedNFTCollection]?.name}
                    </div>
                    <div className="text-white/70">
                      {collectionMetadata[selectedNFTCollection]?.external_url}
                    </div>
                    <div className="flex items-center space-x-2 text-white/50">
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 12 12"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 3.375a.75.75 0 0 0-.752-.75h-.563a.188.188 0 0 1-.188-.188V.75A.75.75 0 0 0 9.745 0H1.503C.663 0-.014.687 0 1.525l.138 8.25a1.502 1.502 0 0 0 1.503 1.475h9.607A.75.75 0 0 0 12 10.5V3.375zM.726 1.687c0-.517.42-.937.94-.937h7.891c.104 0 .188.083.188.188v1.5a.188.188 0 0 1-.188.187H1.666a.939.939 0 0 1-.94-.938zm9.208 6.188a.938.938 0 1 0 .002-1.877.938.938 0 0 0-.002 1.877z"
                          fill="currentColor"
                        />
                      </svg>
                      <div>{abbreviateAddress(selectedNFTCollection)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex bg-[#201F27] flex-col items-center px-8 py-5 text-center rounded-md">
            <Controller
              name="numberOfNFTs"
              control={control}
              defaultValue=""
              render={({ field }) => (
                <>
                  <Text level="2">How many NFTs are in this collection?</Text>
                  <Input
                    placeholder="10,000"
                    data-testid="nft-collection-count"
                    error={errors.numberOfNFTs?.message || ''}
                    {...field}
                  />
                </>
              )}
            />
          </div>
        </div>
        <Controller
          name="approvalThreshold"
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
                      error={errors.approvalThreshold?.message || ''}
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
        faqTitle="About Approval Quorum"
      />
    </form>
  )
}
