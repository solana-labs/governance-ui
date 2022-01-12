import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ArrowLeftIcon,
  DuplicateIcon,
} from '@heroicons/react/outline'
import { ViewState } from './types'
import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import Textarea from 'components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import useWalletStore from 'stores/useWalletStore'
import { validateBuffer } from 'utils/validations'
import { useEffect, useState } from 'react'
import {
  ProgramUpgradeForm,
  UiInstruction,
} from 'utils/uiTypes/proposalCreationTypes'
import {
  getInstructionDataFromBase64,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { RpcContext } from '@solana/spl-governance'
import { Governance } from '@solana/spl-governance'
import { ProgramAccount } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { createProposal } from 'actions/createProposal'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { validateInstruction } from 'utils/instructionTools'
import useAssetsStore from 'stores/useAssetsStore'
import * as yup from 'yup'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { debounce } from '@utils/debounce'
import { isFormValid } from '@utils/formValidation'
import { getProgramVersionForRealm } from '@models/registry/api'

interface UpgradeProgramCompactForm extends ProgramUpgradeForm {
  description: string
  title: string
}

const UpgradeProgram = () => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const program = useAssetsStore((s) => s.compact.currentAsset)
  const governedAccount = {
    governance: program!,
  }
  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query
  const { setCurrentCompactView, resetCompactViewState } = useAssetsStore()
  const {
    realmInfo,
    canChooseWhoVote,
    councilMint,
    realm,
    ownVoterWeight,
    mint,
  } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<UpgradeProgramCompactForm>({
    governedAccount: governedAccount,
    programId: programId?.toString(),
    bufferAddress: '',
    description: '',
    title: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Upgrade ${form.governedAccount?.governance?.account.governedAccount.toBase58()}`

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }
  const schema = yup.object().shape({
    bufferAddress: yup
      .string()
      .test('bufferTest', 'Invalid buffer', async function (val: string) {
        if (val) {
          try {
            await validateBuffer(
              connection,
              val,
              form.governedAccount?.governance?.pubkey
            )
            return true
          } catch (e) {
            return this.createError({
              message: `${e}`,
            })
          }
        } else {
          return this.createError({
            message: `Buffer address is required`,
          })
        }
      }),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const upgradeIx = await createUpgradeInstruction(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.bufferAddress),
        form.governedAccount.governance.pubkey,
        wallet!.publicKey
      )
      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }
  const handlePropose = async () => {
    setIsLoading(true)
    const instruction: UiInstruction = await getInstruction()
    if (instruction.isValid) {
      const governance = form.governedAccount?.governance
      let proposalAddress: PublicKey | null = null
      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.owner.toString()),
        getProgramVersionForRealm(realmInfo!),
        wallet!,
        connection.current,
        connection.endpoint
      )
      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.account?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }
      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ProgramAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.account.config
        )

        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.account.communityMint
          : !councilMint?.supply.isZero()
          ? realm.account.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.account.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }
        //Description same as title
        proposalAddress = await createProposal(
          rpcContext,
          realm.pubkey,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title ? form.title : proposalTitle,
          form.description ? form.description : '',
          proposalMint,
          selectedGovernance?.account?.proposalCount,
          [instructionData],
          false
        )
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
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
    if (form.bufferAddress) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
  }, [form.bufferAddress])
  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        <>
          <ArrowLeftIcon
            onClick={() => setCurrentCompactView(ViewState.AssetOverview)}
            className="h-4 w-4 mr-1 text-primary-light mr-2"
          />
          Upgrade
        </>
      </h3>
      <div className="space-y-4">
        <Input
          label="Buffer address"
          value={form.bufferAddress}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'bufferAddress',
            })
          }
          noMaxWidth={true}
          error={formErrors['bufferAddress']}
        />
        <div className="text-sm mb-3">
          <div className="mb-2">Upgrade authority</div>
          <div className="flex flex-row text-xs items-center break-all">
            <span className="text-fgd-3">
              {form.governedAccount?.governance?.pubkey.toBase58()}
            </span>
            <DuplicateIcon
              className="ml-4 text-th-fgd-1 w-5 h-5 hover:cursor-pointer text-primary-light"
              onClick={() => {
                navigator.clipboard.writeText(
                  form.governedAccount!.governance!.pubkey.toBase58()
                )
              }}
            ></DuplicateIcon>
          </div>
        </div>
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
        <SecondaryButton
          disabled={isLoading}
          className="sm:w-1/2 text-th-fgd-1"
          onClick={handleGoBackToMainView}
        >
          Cancel
        </SecondaryButton>
        <Button
          className="sm:w-1/2"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <div>Propose</div>
        </Button>
      </div>
    </>
  )
}

export default UpgradeProgram
