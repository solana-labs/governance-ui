import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import VoteBySwitch from '../proposal/components/VoteBySwitch'
import Textarea from '@components/inputs/Textarea'
import {
  createSetGovernanceConfig,
  Governance,
  GovernanceConfig,
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
import { useEffect, useState } from 'react'
import Button from '@components/Button'
import BaseGovernanceForm, {
  BaseGovernanceFormFieldsV2,
} from '@components/AssetsList/BaseGovernanceForm'
import { getGovernanceConfigFromV2Form } from '@utils/GovernanceTools'
import {
  getDaysFromTimestamp,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import * as yup from 'yup'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import useProgramVersion from '@hooks/useProgramVersion'
import {
  BaseGovernanceFormFieldsV3,
  transformerGovernanceConfig_2_BaseGovernanceFormFieldsV3,
  transform,
  transformerBaseGovernanceFormFieldsV3_2_GovernanceConfig,
} from '@components/AssetsList/BaseGovernanceForm-data'

type ProposalInfo = {
  title: string
  description: string
}

type GovernanceConfigFormV2 = BaseGovernanceFormFieldsV2 & ProposalInfo
type GovernanceConfigFormV3 = BaseGovernanceFormFieldsV3 & ProposalInfo

type ModalProps = {
  closeProposalModal: () => void
  isProposalModalOpen: boolean
}

type Props = {
  governance: ProgramAccount<Governance>
} & ModalProps

const DEFAULT_PROPOSAL_TITLE = 'Change governance config'

const GovernanceConfigModal = ({
  closeProposalModal,
  isProposalModalOpen,
  governance,
}: Props) => {
  const router = useRouter()
  const { realm, canChooseWhoVote, symbol, mint, realmInfo } = useRealm()
  const config = governance?.account.config
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const { handleCreateProposal } = useCreateProposal()
  const [formErrors, setFormErrors] = useState({})
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const programVersion = useProgramVersion()

  const [form, setForm] = useState<
    GovernanceConfigFormV2 | GovernanceConfigFormV3 | undefined
  >()

  // We should use effects to write default state, not props, if those props can change.
  // (which in this cause they certainly can, its a network query)
  useEffect(() => {
    if (config === undefined) return
    if (mint === undefined) return

    if (programVersion <= 2) {
      setForm({
        _programVersion: 2,
        title: '',
        description: '',
        minCommunityTokensToCreateProposal: mint
          ? DISABLED_VOTER_WEIGHT.eq(config.minCommunityTokensToCreateProposal)
            ? DISABLED_VOTER_WEIGHT.toString()
            : getMintDecimalAmountFromNatural(
                mint,
                config.minCommunityTokensToCreateProposal
              ).toNumber()
          : 0,
        minInstructionHoldUpTime: getDaysFromTimestamp(
          config.minInstructionHoldUpTime
        ),
        maxVotingTime: getDaysFromTimestamp(config.maxVotingTime),
        voteThreshold: config.communityVoteThreshold.value!,
        voteTipping: config.communityVoteTipping,
      })
    } else {
      const baseForm = transform(
        transformerGovernanceConfig_2_BaseGovernanceFormFieldsV3(mint),
        { ...config, _programVersion: 3 }
      )[0]
      setForm({
        title: '',
        description: '',
        ...baseForm,
      })
    }
  }, [config, mint])

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form!, [propertyName]: value })
  }
  // @asktree: I am not really sure of the purpose of this schema.
  const schema = yup.object().shape({})
  const handleCreate = async () => {
    if (form === undefined) return
    if (mint === undefined) return

    const isValid = await validateInstruction({ schema, form, setFormErrors })
    if (isValid && governance?.account && wallet?.publicKey && realm) {
      setCreatingProposal(true)

      const governanceConfig =
        form._programVersion === 2
          ? getGovernanceConfigFromV2Form(realmInfo!.programVersion!, {
              minTokensToCreateProposal:
                form.minCommunityTokensToCreateProposal,
              minInstructionHoldUpTime: form.minInstructionHoldUpTime,
              maxVotingTime: form.maxVotingTime,
              voteThresholdPercentage: form.voteThreshold,
              mintDecimals: mint!.decimals,
              voteTipping: form.voteTipping,
            })
          : new GovernanceConfig(
              transform(
                transformerBaseGovernanceFormFieldsV3_2_GovernanceConfig(mint),
                form
              )[0]
            )

      const instruction = createSetGovernanceConfig(
        realm.owner,
        realmInfo!.programVersion!,
        governance?.pubkey,
        governanceConfig
      )
      const obj: UiInstruction = {
        serializedInstruction: serializeInstructionToBase64(instruction),
        isValid,
        governance,
      }
      const instructionData = new InstructionDataWithHoldUpTime({
        instruction: obj,
        governance,
      })
      try {
        const proposalAddress = await handleCreateProposal({
          title: form!.title ? form!.title : DEFAULT_PROPOSAL_TITLE,
          description: form!.description ? form!.description : '',
          voteByCouncil,
          instructionsData: [instructionData],
          governance: governance!,
        })
        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )
        router.push(url)
      } catch (ex) {
        notify({ type: 'error', message: `${ex}` })
      }
      setCreatingProposal(false)
    }
  }

  return (
    <Modal
      sizeClassName="sm:max-w-3xl"
      onClose={closeProposalModal}
      isOpen={isProposalModalOpen}
    >
      {form === undefined ? null : (
        <>
          <div className="w-full space-y-4">
            <h2 className="flex flex-col mb-4">
              Change Governance Config:{' '}
              {governance && abbreviateAddress(governance.pubkey)}
            </h2>
            <Input
              label="Title"
              placeholder={DEFAULT_PROPOSAL_TITLE}
              value={form.title}
              type="text"
              error={formErrors['title']}
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              label="Description"
              placeholder="Description of your proposal or use a github gist link (optional)"
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
            <BaseGovernanceForm
              formErrors={formErrors}
              form={form}
              setForm={setForm}
              setFormErrors={setFormErrors}
            ></BaseGovernanceForm>
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
        </>
      )}
    </Modal>
  )
}

export default GovernanceConfigModal
