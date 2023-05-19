import { ChevronDownIcon } from '@heroicons/react/solid'
import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { LinkButton } from '@components/Button'
import Textarea from 'components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { getValidatedPublickKey } from 'utils/validations'
import { useEffect, useState } from 'react'
import { UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import { serializeInstructionToBase64 } from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { validateInstruction } from 'utils/instructionTools'
import * as yup from 'yup'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import { createSetUpgradeAuthority } from '@tools/sdk/bpfUpgradeableLoader/createSetUpgradeAuthority'
import { abbreviateAddress } from '@utils/formatting'
import { AssetAccount } from '@utils/uiTypes/assets'
import useWalletOnePointOh from '@hooks/useWalletOnePointOh'

interface CloseBuffersForm {
  governedAccount: AssetAccount | undefined
  programId: string | undefined
  newUpgradeAuthority: string
  description: string
  title: string
}

const TransferUpgradeAuthority = ({ program }: { program: AssetAccount }) => {
  const { handleCreateProposal } = useCreateProposal()
  const router = useRouter()
  const wallet = useWalletOnePointOh()
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol } = router.query
  const { realmInfo, canChooseWhoVote, realm } = useRealm()
  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<CloseBuffersForm>({
    governedAccount: program,
    programId: programId?.toString(),
    newUpgradeAuthority: wallet?.publicKey?.toBase58()
      ? wallet?.publicKey?.toBase58()
      : '',
    description: '',
    title: '',
  })
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Transfer upgrade authority for program ${
    form.governedAccount?.governance?.account.governedAccount
      ? abbreviateAddress(
          form.governedAccount?.governance?.account.governedAccount
        )
      : ''
  }`

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const schema = yup.object().shape({
    newUpgradeAuthority: yup
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
            message: `New upgrade authority address is required`,
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
    let serializedInstruction = ''
    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      const transferUpgradeAuthIx = await createSetUpgradeAuthority(
        form.governedAccount.governance.account.governedAccount,
        form.governedAccount.governance.pubkey,
        new PublicKey(form.newUpgradeAuthority)
      )
      serializedInstruction = serializeInstructionToBase64(
        transferUpgradeAuthIx
      )
    }
    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }
    instructions.push(obj)
    return instructions
  }
  const handlePropose = async () => {
    setIsLoading(true)
    const instructions: UiInstruction[] = await getInstructions()
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

  return (
    <>
      <h3 className="mb-4 flex items-center hover:cursor-pointer">
        Transfer upgrade authority
      </h3>
      <div className="space-y-4">
        <Input
          label="New upgrade authority"
          value={form.newUpgradeAuthority}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'newUpgradeAuthority',
            })
          }
          noMaxWidth={true}
          error={formErrors['newUpgradeAuthority']}
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
      <Button
        className="mt-6"
        onClick={handlePropose}
        isLoading={isLoading}
        disabled={isLoading}
      >
        <div>Propose Transfer Upgrade Authority</div>
      </Button>
    </>
  )
}

export default TransferUpgradeAuthority
