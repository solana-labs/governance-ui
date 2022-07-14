// import Modal from '@components/Modal'
// import Input from '@components/inputs/Input'
// import VoteBySwitch from '../proposal/components/VoteBySwitch'
// import Textarea from '@components/inputs/Textarea'
// import {
//   createSetGovernanceConfig,
//   Governance,
//   ProgramAccount,
//   serializeInstructionToBase64,
// } from '@solana/spl-governance'
// import { validateInstruction } from '@utils/instructionTools'
// import useWalletStore from 'stores/useWalletStore'
// import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
// import useCreateProposal from '@hooks/useCreateProposal'
// import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
// import useQueryContext from '@hooks/useQueryContext'
// import { useRouter } from 'next/router'
// import { notify } from '@utils/notifications'
// import useRealm from '@hooks/useRealm'
// import { useState } from 'react'
// import Button from '@components/Button'
// import {
//   getDaysFromTimestamp,
//   getMintDecimalAmountFromNatural,
// } from '@tools/sdk/units'
// import { abbreviateAddress } from '@utils/formatting'
// import * as yup from 'yup'
// import { useDropzone } from 'react-dropzone'
// import { AssetAccount } from '@utils/uiTypes/assets'
// import GovernedAccountSelect from '@components/inputs/GovernedAccountSelect'
// import useGovernanceAssets from '@hooks/useGovernanceAssets'
// import { AccountType } from '@utils/uiTypes/assets'
// import Bundlr from '@bundlr-network/client'
// import { LAMPORTS_PER_SOL } from '@solana/web3.js'

// interface GovernanceConfigForm {
//   mintAccount: AssetAccount | undefined
//   name: string
//   symbol: string
//   description: string
// }

// const MetadataCreationModal = ({
//   closeModal,
//   isOpen,
//   governance,
// }: {
//   closeModal: () => void
//   isOpen: boolean
//   governance: ProgramAccount<Governance>
// }) => {
//   const router = useRouter()
//   const { realm, canChooseWhoVote, symbol, mint } = useRealm()
//   const { assetAccounts } = useGovernanceAssets()
//   const mintGovernancesWithMintInfo = assetAccounts.filter((x) => {
//     return x.type === AccountType.MINT
//   })

//   const shouldBeGoverned = false
//   const config = governance?.account.config
//   const { fmtUrlWithCluster } = useQueryContext()
//   const wallet = useWalletStore((s) => s.current)
//   const { handleCreateProposal } = useCreateProposal()
//   const [formErrors, setFormErrors] = useState({})
//   const [creatingProposal, setCreatingProposal] = useState(false)
//   const [voteByCouncil, setVoteByCouncil] = useState(false)
//   const [selectedImage, setSelectedImage] = useState<null | string>(null)
//   const [imageFile, setImageFile] = useState<null | Buffer>(null)
//   const [imageUrl, setImageUrl] = useState<null | string>(null)
//   const [form, setForm] = useState<GovernanceConfigForm>({
//     mintAccount: undefined,
//     name: '',
//     symbol: '',
//     description: '',
//   })
//   const { getRootProps, getInputProps } = useDropzone({
//     accept: {
//       'image/*': [],
//     },
//     maxFiles: 1,
//     maxSize: 10 * 1024 * 1024,
//     onDrop: (acceptedFiles) => {
//       const reader = new FileReader()
//       const file = acceptedFiles[0]
//       if (file) {
//         setSelectedImage(URL.createObjectURL(file))
//         reader.onload = function () {
//           if (reader.result) {
//             setImageFile(Buffer.from(reader.result as ArrayBuffer))
//           }
//         }
//         reader.readAsArrayBuffer(file)
//       }
//     },
//   })
//   const handleSetForm = ({ propertyName, value }) => {
//     setFormErrors({})
//     setForm({ ...form!, [propertyName]: value })
//   }
//   const schema = yup.object().shape({})

//   const handleCreate = async () => {
//     const isValid = await validateInstruction({ schema, form, setFormErrors })
//     let serializedInstruction = ''
//     if (isValid && governance?.account && wallet?.publicKey && realm) {
//       setCreatingProposal(true)
//       uploadImage()

//       setCreatingProposal(false)
//     }
//   }

//   const uploadImage = async () => {
//     const bundlr = new Bundlr('http://node1.bundlr.network', 'solana', wallet)
//     if (imageFile == null) return
//     const price = await bundlr.utils.getPrice('solana', imageFile.length)
//     const amount = bundlr.utils.unitConverter(price)
//     const amountNum = amount.toNumber()

//     const loadedBalance = await bundlr.getLoadedBalance()
//     const balance = bundlr.utils.unitConverter(loadedBalance.toNumber())
//     const balanceNum = balance.toNumber()

//     if (balanceNum < amountNum) {
//       await bundlr.fund(LAMPORTS_PER_SOL)
//     }

//     const imageResult = await bundlr.uploader.upload(imageFile, [
//       { name: 'Content-Type', value: 'image/png' },
//     ])

//     const arweaveImageUrl = `https://arweave.net/${imageResult.data.id}?ext=png`

//     if (arweaveImageUrl) {
//       setImageUrl(arweaveImageUrl)
//     }
//   }
//   console.log(imageUrl)
//   const createJson = () => {}
//   const uploadJson = () => {}

//   return (
//     <Modal sizeClassName="sm:max-w-3xl" onClose={closeModal} isOpen={isOpen}>
//       <div className="w-full space-y-4">
//         <h3 className="flex flex-col mb-4">Create token metadata</h3>
//         <GovernedAccountSelect
//           label="Mint"
//           governedAccounts={mintGovernancesWithMintInfo}
//           onChange={(value) => {
//             handleSetForm({ value, propertyName: 'mintAccount' })
//           }}
//           value={form.mintAccount}
//           error={formErrors['mintAccount']}
//           shouldBeGoverned={shouldBeGoverned}
//           governance={governance}
//         />
//         <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
//           <div className="mt-1 sm:mt-0 sm:col-span-1">
//             <div
//               {...getRootProps({
//                 className:
//                   'max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer',
//               })}
//             >
//               <div className="space-y-1 text-center">
//                 <svg
//                   className="mx-auto h-12 w-12 text-gray-400"
//                   stroke="currentColor"
//                   fill="none"
//                   viewBox="0 0 48 48"
//                   aria-hidden="true"
//                 >
//                   <path
//                     d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
//                     strokeWidth={2}
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                   />
//                 </svg>
//                 <div className="flex text-sm text-gray-600">
//                   <label
//                     htmlFor="image-upload"
//                     className="relative cursor-pointer rounded-md font-medium text-primary-dark hover:text-primary-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
//                   >
//                     <span>Upload an image</span>
//                     <input {...getInputProps()} />
//                   </label>
//                   <p className="pl-1">or drag and drop</p>
//                 </div>
//                 {!selectedImage ? null : (
//                   <img src={selectedImage} className="w-32 m-auto" />
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//         <Input
//           label="Name"
//           placeholder={'Token name'}
//           value={form?.name}
//           type="text"
//           error={formErrors['name']}
//           onChange={(evt) =>
//             handleSetForm({
//               value: evt.target.value,
//               propertyName: 'name',
//             })
//           }
//         />
//         <Input
//           label="Symbol"
//           placeholder={'Token symbol like "USDC"'}
//           value={form?.symbol}
//           type="text"
//           error={formErrors['symbol']}
//           onChange={(evt) =>
//             handleSetForm({
//               value: evt.target.value,
//               propertyName: 'symbol',
//             })
//           }
//         />
//         <Textarea
//           label="Description"
//           placeholder="Description of the token"
//           value={form?.description}
//           onChange={(evt) =>
//             handleSetForm({
//               value: evt.target.value,
//               propertyName: 'description',
//             })
//           }
//         ></Textarea>

//         {canChooseWhoVote && (
//           <VoteBySwitch
//             checked={voteByCouncil}
//             onChange={() => {
//               setVoteByCouncil(!voteByCouncil)
//             }}
//           ></VoteBySwitch>
//         )}
//       </div>
//       <div className="flex justify-end pt-6 mt-6 space-x-4 border-t border-fgd-4">
//         <Button
//           isLoading={creatingProposal}
//           disabled={creatingProposal}
//           onClick={() => handleCreate()}
//         >
//           Add proposal
//         </Button>
//       </div>
//     </Modal>
//   )
// }

// export default MetadataCreationModal
