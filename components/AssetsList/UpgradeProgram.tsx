import { ChevronDownIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { LinkButton } from '@components/Button'
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
import { Governance, ProgramAccount } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { validateInstruction } from 'utils/instructionTools'
import * as yup from 'yup'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { debounce } from '@utils/debounce'
import { isFormValid } from '@utils/formValidation'
import ProgramUpgradeInfo from 'pages/dao/[symbol]/proposal/components/instructions/bpfUpgradeableLoader/ProgramUpgradeInfo'
import { getProgramName } from '@components/instructions/programs/names'
import useCreateProposal from '@hooks/useCreateProposal'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import useWalletOnePointOh from '@hooks/useWallet'

interface UpgradeProgramCompactForm extends ProgramUpgradeForm {
  description: string
  title: string
}

const UpgradeProgram = ({
  program,
}: {
  program: ProgramAccount<Governance>
}) => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletOnePointOh()
  const { assetAccounts } = useGovernanceAssets()
  const governedAccount = assetAccounts.find(
    (x) => x.governance.pubkey.toBase58() === program.pubkey.toBase58()
  )
  const { handleCreateProposal } = useCreateProposal()
  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query
  const { realmInfo, canChooseWhoVote, realm } = useRealm()
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
  const name = program ? getProgramName(program.account.governedAccount) : ''

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
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

        proposalAddress = await handleCreateProposal({
          title: form.title ? form.title : proposalTitle,
          description: form.description ? form.description : '',
          governance: selectedGovernance,
          instructionsData: [instructionData],
          voteByCouncil,
          isDraft: false,
        })
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [realmInfo?.programId])

  useEffect(() => {
    if (form.bufferAddress) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)
        setFormErrors(validationErrors)
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [form.bufferAddress])
  return (
    <>
      <h3 className="mb-4">Upgrade {name}</h3>
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
        <ProgramUpgradeInfo
          governancePk={form.governedAccount?.governance?.pubkey}
        />
        <LinkButton
          className="flex items-center text-primary-light"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? 'Less Options' : 'More Options'}
          <ChevronDownIcon
            className={`default-transition h-5 w-5 ml-1 ${
              showOptions ? 'transform rotate-180' : 'transform rotate-360'
            }`}
          />
        </LinkButton>
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
            />
            {canChooseWhoVote && (
              <VoteBySwitch
                checked={voteByCouncil}
                onChange={() => {
                  setVoteByCouncil(!voteByCouncil)
                }}
              />
            )}
          </>
        )}
      </div>
      <Button className="mt-6" onClick={handlePropose} isLoading={isLoading}>
        <div>Propose Upgrade</div>
      </Button>
    </>
  )
}

export default UpgradeProgram
