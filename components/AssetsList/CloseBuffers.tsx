import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ExternalLinkIcon,
} from '@heroicons/react/outline'
import { AccountInfo, ParsedAccountData, PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button from '@components/Button'
import Textarea from 'components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import useWalletStore from 'stores/useWalletStore'
import { getValidatedPublickKey } from 'utils/validations'
import { useEffect, useState } from 'react'
import { UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { validateInstruction } from 'utils/instructionTools'
import useAssetsStore from 'stores/useAssetsStore'
import * as yup from 'yup'
import { BPF_UPGRADE_LOADER_ID, GovernedProgramAccount } from '@utils/tokens'
import Loading from '@components/Loading'
import useCreateProposal from '@hooks/useCreateProposal'
import CommandLineInfo from 'pages/dao/[symbol]/proposal/components/ComandLineInfo'
import { getExplorerUrl } from '@components/explorer/tools'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { createCloseBuffer } from '@tools/sdk/bpfUpgradeableLoader/createCloseBuffer'

interface CloseBuffersForm {
  governedAccount: GovernedProgramAccount | undefined
  programId: string | undefined
  solReceiverAddress: string
  description: string
  title: string
}

const CloseBuffers = () => {
  const { handleCreateProposal } = useCreateProposal()
  const { resetCompactViewState } = useAssetsStore()
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const program = useAssetsStore((s) => s.compact.currentAsset)
  const governedAccount = {
    governance: program!,
  }
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = router.query
  const { realmInfo, canChooseWhoVote, realm } = useRealm()
  const [isBuffersLoading, setIsBuffersLoading] = useState(false)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [buffers, setBuffers] = useState<
    {
      pubkey: PublicKey
      account: AccountInfo<Buffer | ParsedAccountData>
    }[]
  >([])
  const [form, setForm] = useState<CloseBuffersForm>({
    governedAccount: governedAccount,
    programId: programId?.toString(),
    solReceiverAddress: '',
    description: '',
    title: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Close unused buffers of ${form.governedAccount?.governance?.account.governedAccount.toBase58()}`

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const schema = yup.object().shape({
    solReceiverAddress: yup
      .string()
      .test('accountTests', 'Account validation error', function (val: string) {
        if (val) {
          try {
            return !!getValidatedPublickKey(val)
          } catch (e) {
            console.log(e)
            return this.createError({
              message: `${e}`,
            })
          }
        } else {
          return this.createError({
            message: `Retrieved SOL receiver address is required`,
          })
        }
      }),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  async function getInstructions(): Promise<UiInstruction[]> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const instructions: UiInstruction[] = []
    for (let i = 0; i < buffers.length; i++) {
      let serializedInstruction = ''
      if (
        isValid &&
        programId &&
        form.governedAccount?.governance?.account &&
        wallet?.publicKey
      ) {
        const closeIx = await createCloseBuffer(
          buffers[i].pubkey,
          new PublicKey(form.solReceiverAddress),
          form.governedAccount.governance.pubkey
        )
        console.log(closeIx)
        serializedInstruction = serializeInstructionToBase64(closeIx)
      }
      const obj: UiInstruction = {
        serializedInstruction: serializedInstruction,
        isValid,
        governance: form.governedAccount?.governance,
      }
      instructions.push(obj)
    }
    return instructions
  }
  const handlePropose = async () => {
    setIsLoading(true)
    const instructions: UiInstruction[] = await getInstructions()
    console.log(instructions)
    if (instructions.length && instructions[0].isValid) {
      const governance = form.governedAccount?.governance
      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const instructionsData = instructions.map(
        (x) =>
          new InstructionDataWithHoldUpTime({
            instruction: x,
            governance,
          })
      )
      try {
        const proposalAddress = await handleCreateProposal({
          title: form.title ? form.title : proposalTitle,
          description: form.description ? form.description : '',
          voteByCouncil,
          instructionsData: instructionsData,
          governance: governance!,
        })
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        resetCompactViewState()
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    const getBuffers = async () => {
      try {
        setBuffers([])
        setIsBuffersLoading(true)
        const buffers = await connection.current.getParsedProgramAccounts(
          BPF_UPGRADE_LOADER_ID,
          {
            filters: [
              {
                memcmp: {
                  offset: 5,
                  bytes: form.governedAccount!.governance!.pubkey.toBase58(),
                },
              },
            ],
          }
        )
        console.log(buffers)
        setBuffers(buffers)
      } catch (e) {
        notify({ type: 'error', message: "Can't fetch buffers" })
      }
      setIsBuffersLoading(false)
    }
    if (form.governedAccount?.governance?.pubkey.toBase58()) {
      getBuffers()
    }
  }, [form.governedAccount?.governance?.pubkey.toBase58()])
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        Close buffers
      </h3>
      <div className="space-y-4">
        <Input
          label="Retrieved SOL receiver address"
          value={form.solReceiverAddress}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'solReceiverAddress',
            })
          }
          noMaxWidth={true}
          error={formErrors['solReceiverAddress']}
        />
        <div className="bg-bkg-1 mb-3 px-4 py-2 rounded-md w-full">
          <p className="text-fgd-3 text-xs">Bufffers to close</p>
          {isBuffersLoading ? (
            <Loading></Loading>
          ) : (
            <>
              {buffers.map((x) => (
                <div
                  className="mb-2 flex items-center text-xs"
                  key={x.pubkey.toBase58()}
                >
                  {x.pubkey.toBase58()}
                  <a
                    href={getExplorerUrl(connection.endpoint, x.pubkey)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <ExternalLinkIcon className="flex-shrink-0 h-4 ml-2 mt-0.5 text-primary-light w-4" />
                  </a>
                </div>
              ))}
              {!buffers.length && 'No buffers found'}
            </>
          )}
        </div>
        <div className="mb-2">Upgrade authority</div>
        <CommandLineInfo
          info={form.governedAccount?.governance?.pubkey.toBase58()}
        ></CommandLineInfo>
        <div
          className={'flex items-center hover:cursor-pointer w-24 mt-3'}
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleUpIcon className="h-4 w-4 mr-1 text-primary-light" />
          ) : (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          )}
          <small className="text-fgd-3">Options</small>
        </div>
        {showOptions && (
          <>
            <Input
              noMaxWidth={true}
              label="Proposal Title"
              placeholder={proposalTitle}
              value={form.title}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              noMaxWidth={true}
              label="Proposal Description"
              placeholder={
                'Description of your proposal or use a github gist link (optional)'
              }
              wrapperClassName="mb-5"
              value={form.description}
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
          </>
        )}
      </div>
      <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0 mt-4">
        <Button
          className="ml-auto"
          onClick={handlePropose}
          isLoading={isLoading}
          disabled={isLoading || !buffers.length}
        >
          <div>Propose close all</div>
        </Button>
      </div>
    </>
  )
}

export default CloseBuffers
