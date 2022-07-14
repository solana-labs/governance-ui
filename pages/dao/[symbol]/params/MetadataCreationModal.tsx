import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import VoteBySwitch from '../proposal/components/VoteBySwitch'
import Textarea from '@components/inputs/Textarea'
import {
  createSetGovernanceConfig,
  Governance,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import useWalletStore from 'stores/useWalletStore'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import useRealm from '@hooks/useRealm'
import { useState } from 'react'
import Button from '@components/Button'
import {
  getDaysFromTimestamp,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import * as yup from 'yup'
import { useDropzone } from 'react-dropzone'

interface GovernanceConfigForm {
  mintAccount: string
  name: string
  symbol: string
  description: string
  jsonURL: string
}

const MetadataCreationModal = ({
  closeModal,
  isOpen,
  governance,
}: {
  closeModal: () => void
  isOpen: boolean
  governance: ProgramAccount<Governance>
}) => {
  const router = useRouter()
  const { realm, canChooseWhoVote, symbol, mint } = useRealm()
  const config = governance?.account.config
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const { handleCreateProposal } = useCreateProposal()
  const [formErrors, setFormErrors] = useState({})
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [selectedImage, setSelectedImage] = useState<null | string>(null)
  const [imageFile, setImageFile] = useState<null | Buffer>(null)
  const [imageUrl, setImageUrl] = useState(null)
  const [form, setForm] = useState<GovernanceConfigForm>({
    name: '',
    description: '',
  })
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form!, [propertyName]: value })
  }
  const schema = yup.object().shape({})
  const handleCreate = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (isValid && governance?.account && wallet?.publicKey && realm) {
      setCreatingProposal(true)

      setCreatingProposal(false)
    }
  }

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': [],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    onDrop: (acceptedFiles) => {
      const reader = new FileReader()
      const file = acceptedFiles[0]
      if (file) {
        setSelectedImage(file.name)
        reader.onload = function () {
          if (reader.result) {
            setImageFile(Buffer.from(reader.result as ArrayBuffer))
          }
        }
        reader.readAsArrayBuffer(file)
      }
    },
  })

  return (
    <Modal sizeClassName="sm:max-w-3xl" onClose={closeModal} isOpen={isOpen}>
      <div className="w-full space-y-4">
        <h3 className="flex flex-col mb-4">Create token metadata</h3>
        <div className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-1">
          {!imageUrl ? (
            <div className="mt-1 sm:mt-0 sm:col-span-1">
              <div
                {...getRootProps({
                  className:
                    'max-w-lg flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md cursor-pointer',
                })}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="image-upload"
                      className="relative cursor-pointer rounded-md font-medium text-primary-dark hover:text-primary-light focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                    >
                      <span>Upload an image</span>
                      <input {...getInputProps()} />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  {!selectedImage ? null : (
                    <p className="text-sm text-gray-500">{selectedImage}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-5 bg-white space-y-6 sm:p-6">
              <a href={imageUrl} target="_blank" rel="noreferrer">
                {imageUrl}
              </a>
            </div>
          )}
        </div>
        <Input
          label="Name"
          placeholder={'Token name'}
          value={form?.name}
          type="text"
          error={formErrors['name']}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'name',
            })
          }
        />
        <Input
          label="Symbol"
          placeholder={'Token symbol like "USDC"'}
          value={form?.name}
          type="text"
          error={formErrors['symbol']}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'symbol',
            })
          }
        />
        <Textarea
          label="Description"
          placeholder="Description of the metadata (optional)"
          value={form?.description}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'description',
            })
          }
        ></Textarea>

        {canChooseWhoVote && (
          <VoteBySwitch
            checked={voteByCouncil}
            onChange={() => {
              setVoteByCouncil(!voteByCouncil)
            }}
          ></VoteBySwitch>
        )}
      </div>
      <div className="flex justify-end pt-6 mt-6 space-x-4 border-t border-fgd-4">
        <Button
          isLoading={creatingProposal}
          disabled={creatingProposal}
          onClick={() => handleCreate()}
        >
          Add proposal
        </Button>
      </div>
    </Modal>
  )
}

export default MetadataCreationModal
