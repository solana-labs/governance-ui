import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import axios from 'axios'

import { updateUserInput, validatePubkey } from '@utils/formValidation'
import { notify } from '@utils/notifications'
import { abbreviateAddress } from '@utils/formatting'

import useWalletStore from 'stores/useWalletStore'

import { NewButton as Button } from '@components/Button'
import Text from '@components/Text'
import FormHeader from '@components/NewRealmWizard/components/FormHeader'
import FormField from '@components/NewRealmWizard/components/FormField'
import FormFooter from '@components/NewRealmWizard/components/FormFooter'
import Input, {
  InputRangeSlider,
} from '@components/NewRealmWizard/components/Input'
import AdviceBox from '@components/NewRealmWizard/components/AdviceBox'
import NFTCollectionModal from '@components/NewRealmWizard/components/NFTCollectionModal'
import { Metaplex } from '@metaplex-foundation/js'
import { Connection, PublicKey } from '@solana/web3.js'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

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
      if (nft.data?.collection) {
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

async function enrichCollectionInfo(
  connection: Connection,
  collectionKey: string
) {
  const metaplex = new Metaplex(connection)
  const data = await metaplex
    .nfts()
    .findByMint({ mintAddress: new PublicKey(collectionKey) })

  const collectionData = data
  return enrichItemInfo(
    {
      ...collectionData,
      collectionMintAddress: collectionKey,
    },
    collectionData.uri
  )
}

async function getNFTCollectionInfo(
  connection: Connection,
  collectionKey: string
) {
  const metaplex = new Metaplex(connection)
  const data = await metaplex.nfts().findByMint({
    mintAddress: new PublicKey(collectionKey),
  })
  console.log('collection', collectionKey, data)

  return [data, await enrichCollectionInfo(connection, collectionKey)] as const
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
  collectionMetadata: NFTCollection
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

interface NFTCollection extends NFT {
  nfts: NFT[]
}

export function WalletIcon() {
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

function SkeletonNFTCollectionInfo() {
  return (
    <>
      <div className="w-24 h-24 opacity-50 text-fgd-3">
        <svg viewBox="0 0 34 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M24.6817 1.90042C24.503 1.23359 23.8176 0.837858 23.1508 1.01654L9.9316 4.55861L3.87786 5.18346C3.21601 5.25178 2.72831 5.82475 2.75733 6.48095L1.90042 6.71056C1.23359 6.88923 0.837858 7.57466 1.01654 8.24149L4.1401 19.8988L5.0216 28.4389C5.09247 29.1256 5.70662 29.6249 6.39333 29.554L6.56349 29.5364C6.7135 29.6001 6.87853 29.6354 7.0518 29.6354H10.3902L30.1418 31.0805C30.8303 31.1309 31.4293 30.6136 31.4797 29.9251L33.085 7.98374C33.1354 7.29522 32.6181 6.69623 31.9296 6.64585L30.3018 6.52675V6.3854C30.3018 5.69504 29.7422 5.13539 29.0518 5.13539L27.2464 5.13539L27.1333 4.03973C27.0625 3.35302 26.4483 2.85379 25.7616 2.92467L24.9778 3.00557L24.6817 1.90042ZM24.4741 3.05756L24.1988 2.02983C24.0915 1.62973 23.6803 1.39229 23.2802 1.4995L13.0739 4.23427L24.4741 3.05756ZM27.298 5.63539L29.3921 25.9235C29.463 26.6102 28.9638 27.2243 28.2771 27.2952C22.3207 27.91 16.3728 28.5239 10.4487 29.1354L29.0518 29.1354C29.466 29.1354 29.8018 28.7996 29.8018 28.3854L29.8018 6.3854C29.8018 5.97118 29.466 5.63539 29.0518 5.63539L27.298 5.63539ZM3.81576 16.7565L2.80719 6.98523L2.02983 7.19352C1.62973 7.30073 1.39229 7.71198 1.4995 8.11208L3.81576 16.7565ZM30.3018 28.3854L30.3018 7.02809L31.8931 7.14452C32.3062 7.17475 32.6166 7.53414 32.5864 7.94725L30.981 29.8886C30.9508 30.3017 30.5914 30.6121 30.1783 30.5819L17.2422 29.6354L29.0518 29.6354C29.7422 29.6354 30.3018 29.0758 30.3018 28.3854ZM25.8129 3.42203C26.225 3.3795 26.5934 3.67904 26.636 4.09106L27.5864 13.2991C26.8436 12.7024 25.8975 12.0851 25.0457 11.7194C23.8693 11.2142 22.4448 10.9094 20.5486 10.859C20.3579 10.854 20.1845 10.7928 20.0507 10.6909L17.8535 9.01673C16.8506 8.25254 15.4769 9.24495 15.8606 10.4378L16.4784 12.3585C16.1456 12.6021 15.7823 12.9268 15.4495 13.3193L7.78682 11.2274C7.38301 11.1172 6.96257 11.3294 6.80846 11.718C6.65455 12.1061 6.81405 12.5496 7.18153 12.7486L14.1802 16.5388C13.8 18.51 13.2892 20.0635 12.8782 21.2065C12.5867 22.017 13.1544 22.8935 14.0256 22.9333L15.2789 22.9906C16.0134 23.0242 16.6887 22.5906 16.9679 21.9087L17.2068 21.325C17.2553 21.2065 17.395 21.0951 17.6037 21.0953C18.4112 21.0958 19.5095 20.9782 20.4174 20.3113C20.8156 20.0188 21.1519 19.6398 21.4074 19.1653C21.5318 19.2349 21.656 19.316 21.768 19.4069C22.0615 19.6453 22.1529 19.8484 22.1529 20.0001C22.1529 20.3916 21.9665 20.7724 21.5062 21.2374C21.1162 21.6314 20.6139 22.0046 20.0216 22.4438C19.894 22.5385 19.7625 22.636 19.6281 22.7368C18.227 23.7876 16.4254 25.6778 16.1465 28.0446L6.34199 29.0566C5.92997 29.0992 5.56148 28.7996 5.51895 28.3876L3.26017 6.50386C3.21764 6.09183 3.51717 5.72335 3.9292 5.68082L25.8129 3.42203ZM24.8485 12.1788C25.8041 12.5892 26.9102 13.3504 27.6603 14.0147L28.8948 25.9748C28.9373 26.3868 28.6378 26.7553 28.2257 26.7978L16.6575 27.9919C16.9553 25.8815 18.5849 24.1442 19.9281 23.1368C20.0612 23.037 20.1917 22.9402 20.3195 22.8454L20.3306 22.8372C20.9099 22.4076 21.4419 22.013 21.8615 21.5892C22.3665 21.079 22.6529 20.5786 22.6529 20.0001C22.6529 19.6339 22.4329 19.3028 22.0832 19.0188C21.8653 18.8418 21.6186 18.7016 21.4001 18.601L21.1718 18.496L21.0679 18.7248C20.837 19.2334 20.5131 19.6206 20.1214 19.9084C19.3433 20.4799 18.3766 20.5958 17.604 20.5953C17.2144 20.595 16.8776 20.8095 16.7441 21.1355L16.5051 21.7192C16.3055 22.2069 15.8237 22.515 15.3018 22.4911L14.0484 22.4338C13.5211 22.4097 13.1686 21.8766 13.3487 21.3757C13.777 20.1845 14.3156 18.544 14.7056 16.4518L14.739 16.2728L7.41964 12.3089C7.27609 12.2312 7.21215 12.0564 7.27325 11.9023C7.33415 11.7487 7.49881 11.6671 7.65514 11.7098L15.6321 13.8874L15.7347 13.7593C16.1123 13.2877 16.5448 12.9132 16.9129 12.6639L17.0681 12.5587L16.3366 10.2847C16.0994 9.54728 16.9456 8.95354 17.5505 9.41444L19.7477 11.0886C19.9702 11.2581 20.2466 11.3512 20.5353 11.3588C22.3838 11.4079 23.7431 11.7042 24.8485 12.1788Z"
            fill="currentColor"
          />
        </svg>
      </div>
      <div className="space-y-2 truncate">
        <div className="text-transparent truncate rounded w-fit bg-fgd-4 opacity-40">
          Collection name...
        </div>
        <div className="text-transparent truncate rounded w-fit bg-fgd-4 opacity-40">
          Loading-long-url-to-some-obscure-wallet-address
        </div>
        <div className="text-transparent truncate rounded w-fit bg-fgd-4 opacity-40">
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
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const connected = !!wallet?.connected
  const [walletConnecting, setWalletConnecting] = useState(false)
  const [requestPending, setRequestPending] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [collectionsInWallet, setCollectionsInWallet] = useState({})

  const [
    selectedNFTCollection,
    setSelectedNFTCollection,
  ] = useState<NFTCollection>()

  const schema = yup.object(AddNFTCollectionSchema).required()
  const {
    control,
    register,
    watch,
    setValue,
    setError,
    setFocus,
    clearErrors,
    handleSubmit,
    formState: { isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  })
  const [
    collectionVerificationState,
    setCollectionVerificationState,
  ] = useState<
    'none' | 'invalid' | 'verified' | 'is nft but no collection details'
  >('none')
  const collectionKey = watch('collectionKey')
  const numberOfNFTs = watch('numberOfNFTs') || 10000
  const approvalPercent = watch('communityYesVotePercentage', 60) || 60
  const approvalSize = approvalPercent
    ? Math.ceil((Number(numberOfNFTs) * approvalPercent) / 100)
    : undefined

  useEffect(() => {
    updateUserInput(formData, AddNFTCollectionSchema, setValue)
    setSelectedNFTCollection(formData?.collectionMetadata)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [])

  useEffect(() => {
    if (collectionVerificationState === 'invalid' || selectedNFTCollection) {
      setFocus('numberOfNFTs')
    } else {
      // setFocus('collectionInput')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [collectionVerificationState, selectedNFTCollection])

  function serializeValues(values) {
    const data = {
      numberOfNFTs: null,
      ...values,
      collectionInput: null,
      collectionMetadata: selectedNFTCollection,
    }
    onSubmit({ step: currentStep, data })
  }

  async function handleAdd(collectionInput) {
    clearErrors()

    if (validatePubkey(collectionInput)) {
      handleClearSelectedNFT(false)
      setRequestPending(true)
      try {
        const [nft, collectionInfo] = await getNFTCollectionInfo(
          connection.current,
          collectionInput
        )
        console.log('NFT collection info from user input:', collectionInfo)
        setValue('collectionKey', collectionInput)
        setCollectionVerificationState(
          nft.collectionDetails !== null
            ? 'verified'
            : 'is nft but no collection details'
        )
        setSelectedNFTCollection(collectionInfo)
        setRequestPending(false)
      } catch (err) {
        setRequestPending(false)
        setValue('collectionKey', collectionInput)
        setCollectionVerificationState('invalid')
      }
    } else {
      setError('collectionInput', {
        type: 'error',
        message: 'Address is invalid',
      })
    }
  }

  async function handleClearSelectedNFT(clearInput = true) {
    if (clearInput) {
      setValue('collectionInput', '')
    }
    clearErrors('collectionInput')
    setValue('collectionKey', '')
    setCollectionVerificationState('none')
    setSelectedNFTCollection(undefined)
  }

  async function handlePaste(ev) {
    const value = ev.clipboardData.getData('text')
    ev.currentTarget.value += value
    setValue('collectionInput', ev.currentTarget.value)
    handleAdd(ev.currentTarget.value)
    ev.preventDefault()
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
      const metaplex = new Metaplex(connection.current)
      const ownedNfts = await metaplex.nfts().findAllByOwner({
        owner: wallet.publicKey,
      })
      console.log('NFT wallet contents', ownedNfts)
      const verfiedNfts = filterAndMapVerifiedCollections(ownedNfts)
      console.log('NFT verified nft by collection', verfiedNfts)

      const verifiedCollections = {}
      for (const collectionKey in verfiedNfts) {
        const collectionInfo = await enrichCollectionInfo(
          connection.current,
          collectionKey
        )

        const nftsWithInfo = await Promise.all(
          verfiedNfts[collectionKey].slice(0, 2).map((nft) => {
            return enrichItemInfo(nft, nft.uri)
          })
        )

        verifiedCollections[collectionKey] = {
          ...collectionInfo,
          nfts: nftsWithInfo,
        }
      }

      console.log(
        'NFT verified collection metadata with nfts',
        verifiedCollections
      )
      if (Object.keys(verifiedCollections).length === 0) {
        setError(
          'collectionInput',
          {
            type: 'error',
            message: 'Current wallet has no verified collection',
          },
          { shouldFocus: true }
        )
      } else {
        setCollectionsInWallet(verifiedCollections)
        setIsModalOpen(true)
      }
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

  return (
    <form
      onSubmit={handleSubmit(serializeValues)}
      data-testid="add-nft-collection-form"
    >
      <NFTCollectionModal
        show={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        walletPk={wallet?.publicKey}
        collections={collectionsInWallet}
        onSelect={({ key, collection }) => {
          if (key && collection) {
            handleClearSelectedNFT(true)
            setValue('collectionKey', key)
            setSelectedNFTCollection(collection)
          }
        }}
      />
      <FormHeader
        type={type}
        currentStep={currentStep}
        totalSteps={totalSteps}
        title="Select an NFT collection for your DAO."
      />
      <div className="mt-20 space-y-10 md:space-y-12">
        <Controller
          name="collectionInput"
          control={control}
          defaultValue=""
          render={({ field, fieldState: { error } }) => (
            <FormField
              title="What is the NFT collection address?"
              description={
                <div>
                  Only{' '}
                  <a
                    href="https://www.metaplex.com/posts/certified-collections"
                    target="_blank"
                    rel="noreferrer"
                    className="underline hover:text-fgd-3"
                  >
                    Metaplex standard certified collections
                  </a>{' '}
                  may be used.
                </div>
              }
            >
              <Input
                placeholder="e.g. SMBH3wF6baUj6JWtzYvqcKuj2XCKWDqQxzspY12xPND"
                data-testid="nft-address"
                error={
                  error?.message ?? collectionVerificationState === 'invalid'
                    ? 'Error: this is not an nft collection'
                    : ''
                }
                warning={
                  collectionVerificationState ===
                  'is nft but no collection details'
                    ? 'Caution: this is an nft, but has no collection details. It may be an old collection, or just a regular nft. Please double check'
                    : ''
                }
                {...field}
                disabled={requestPending}
                onKeyDown={(ev) => {
                  if (ev.key === 'Enter') {
                    handleAdd(ev.currentTarget.value)
                  }
                }}
                onPaste={handlePaste}
                onBlur={(ev) => {
                  // field.onBlur()
                  handleAdd(ev.currentTarget.value)
                }}
              />
              <div className="flex items-center justify-center space-x-4 md:justify-start">
                <Text level="2">or</Text>
                <Button
                  type="button"
                  secondary
                  disabled={requestPending || walletConnecting}
                  loading={requestPending || walletConnecting}
                  onClick={handleSelectFromWallet}
                  className=""
                >
                  <div className="flex items-center justify-center px-4 space-x-2">
                    <WalletIcon />
                    <span>Select from Wallet</span>
                  </div>
                </Button>
              </div>
            </FormField>
          )}
        />
        <input className="hidden" {...register('collectionKey')} disabled />

        {collectionVerificationState === 'none' && (
          <div
            className={`flex flex-col w-full px-4 py-5 rounded-md bg-bkg-3  ${
              requestPending ? 'animate-pulse' : ''
            }`}
          >
            {requestPending ? (
              <Text level="2">Getting collection data</Text>
            ) : (
              <Text level="2" className="flex space-x-4">
                {!selectedNFTCollection?.name ? (
                  'Select a collection to preview...'
                ) : (
                  <>
                    <div className="text-green">Verified collection</div>
                    <div
                      className="underline hover:text-fgd-2 hover:cursor-pointer"
                      onClick={() => handleClearSelectedNFT(true)}
                    >
                      Clear
                    </div>
                  </>
                )}
              </Text>
            )}

            <div className="flex mt-5 space-x-2">
              {!selectedNFTCollection?.name ? (
                <SkeletonNFTCollectionInfo />
              ) : (
                <div className="flex w-full">
                  <div className="relative h-24 pl-2 shrink-0 w-28">
                    {selectedNFTCollection?.nfts
                      ?.slice(0, 3)
                      .map((nft, index) => {
                        return (
                          <img
                            key={nft.name}
                            src={nft.image}
                            alt="collection item"
                            className={`absolute w-24 rounded-md ${
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
                      src={selectedNFTCollection?.image}
                      className="absolute w-24 rounded-md"
                    />
                  </div>
                  <div className="grid w-full pl-4">
                    <Text level="1" className="break-words">
                      {selectedNFTCollection?.name ||
                        '(Collection has no name)'}
                    </Text>
                    <Text level="2" className="truncate text-fgd-2">
                      {selectedNFTCollection?.external_url ? (
                        <a
                          href={selectedNFTCollection.external_url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {selectedNFTCollection.external_url}
                        </a>
                      ) : (
                        '(No external address)'
                      )}
                    </Text>
                    <Text
                      level="2"
                      className="flex items-baseline mt-2 space-x-2 text-fgd-2"
                    >
                      <WalletIcon />
                      <span>
                        {collectionKey && abbreviateAddress(collectionKey)}
                      </span>
                    </Text>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {collectionKey && (
          <>
            <Controller
              name="numberOfNFTs"
              control={control}
              defaultValue=""
              render={({ field, fieldState: { error } }) => (
                <FormField
                  title="How many NFTs are in this collection?"
                  description="This is necessary for calculating the number of votes needed for a proposal to pass. Please be accurate."
                >
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
                    placeholder="e.g. 10,000"
                    data-testid="nft-collection-count"
                    error={error?.message || ''}
                    {...field}
                  />
                </FormField>
              )}
            />
            <Controller
              name="communityYesVotePercentage"
              control={control}
              defaultValue={60}
              render={({ field, fieldState: { error } }) => (
                <FormField
                  title="Adjust how much of the total NFT supply is needed to pass a proposal"
                  description=""
                >
                  <InputRangeSlider
                    field={field}
                    error={error?.message}
                    placeholder="60"
                  />
                </FormField>
              )}
            />

            <AdviceBox
              title="Approval threshold"
              icon={<img src="/icons/threshold-icon.svg" alt="voting icon" />}
            >
              <Text level="1" className="space-y-1 text-white/70">
                <div>
                  With{' '}
                  {numberOfNFTs && !isNaN(numberOfNFTs)
                    ? Number(numberOfNFTs).toLocaleString()
                    : '???'}{' '}
                  NFT holders,
                </div>
                <div>
                  {approvalSize?.toLocaleString() || '???'} members would need
                  to approve a proposal for it to pass.
                </div>
              </Text>
            </AdviceBox>
          </>
        )}
      </div>
      <FormFooter
        isValid={isValid}
        prevClickHandler={() => onPrevClick(currentStep)}
      />
    </form>
  )
}
