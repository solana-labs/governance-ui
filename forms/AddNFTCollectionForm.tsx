import React, { Fragment, useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Metadata } from '@metaplex-foundation/mpl-token-metadata'
import axios from 'axios'

import { updateUserInput } from '@utils/formValidation'
import { notify } from '@utils/notifications'
import { abbreviateAddress } from '@utils/formatting'

import useWalletStore from 'stores/useWalletStore'

import { Dialog, Transition } from '@headlessui/react'
import FormHeader from '../components_2/FormHeader'
import FormField from '../components_2/FormField'
import FormFooter from '../components_2/FormFooter'
import Button from '../components_2/Button'
import Input from '../components_2/Input'
import Header from '../components_2/Header'
import NFTCollectionSelector from 'components_2/NFTCollectionSelector'

import { ThresholdAdviceBox } from './MemberQuorumThresholdForm'

export const AddNFTCollectionSchema = {
  collectionAddress: yup.string(),
  numberOfNFTs: yup.number(),
  approvalThreshold: yup
    .number()
    .typeError('Required')
    .max(100, 'Approval cannot require more than 100% of votes')
    .min(1, 'Approval must be at least 1% of votes')
    .required('Required'),
}

export interface AddNFTCollection {
  collectionAddress: string
  approvalThreshold: number
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
  const [modalOpen, setModalOpen] = useState(true)
  const [collectionMetadata, setCollectionMetadata] = useState({})
  const [collectionsAvailable, setCollectionsAvailable] = useState({})
  const [selectedNFTCollection, setSelectedNFTCollection] = useState('')
  const schema = yup.object(AddNFTCollectionSchema).required()
  const {
    control,
    watch,
    setValue,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const userAddress = wallet?.publicKey?.toBase58()
  const collectionAddress = watch('collectionAddress')
  const numberOfNFTs = watch('numberOfNFTs', '')
  const approvalPercent = watch('approvalThreshold', 60)
  const approvalSize = numberOfNFTs
    ? Math.ceil(Number(numberOfNFTs) * approvalPercent)
    : undefined

  useEffect(() => {
    updateUserInput(formData, AddNFTCollectionSchema, setValue)
  }, [])

  // useEffect(() => {
  // function
  // }, [collectionAddress])

  function serializeValues(values) {
    onSubmit({ step: currentStep, data: values })
  }

  function handleAdd() {}

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
      setModalOpen(true)
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

  function closeModal() {
    setModalOpen(false)
  }

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
          name="collectionAddress"
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
                error={errors.collectionAddress?.message || ''}
                {...field}
              />
              <Button type="button" secondary onClick={handleAdd}>
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
        <Controller
          name="approvalThreshold"
          control={control}
          defaultValue={60}
          render={({ field }) => (
            <FormField
              title="Adjust how much of the total NFT supply is needed to pass a proposal"
              description=""
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-[4.5rem]">
                    <Input
                      type="number"
                      placeholder="60"
                      data-testid="dao-quorum-input"
                      error={errors.approvalThreshold?.message || ''}
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
        onChange={setSelectedNFTCollection}
        value={selectedNFTCollection}
      />

      <ThresholdAdviceBox title="Approval threshold">
        <div className="text-lg">With {numberOfNFTs} NFTs in your DAO</div>
        <div className="pt-2 text-lg">
          {approvalSize} worth of NFTs would need to approve a proposal for it
          to pass.
        </div>
      </ThresholdAdviceBox>

      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
        faqTitle="About Approval Quorum"
      />
    </form>
  )
}
