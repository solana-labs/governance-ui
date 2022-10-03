/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
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
import { useEffect, useState } from 'react'
import Button from '@components/Button'
import BaseGovernanceForm, {
  BaseGovernanceFormFieldsV2,
  BaseGovernanceFormFieldsV3,
} from '@components/AssetsList/BaseGovernanceForm'
import { getGovernanceConfig } from '@utils/GovernanceTools'
import {
  getDaysFromTimestamp,
  getMintDecimalAmountFromNatural,
} from '@tools/sdk/units'
import { abbreviateAddress } from '@utils/formatting'
import * as yup from 'yup'
import BN from 'bn.js'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import useProgramVersion from '@hooks/useProgramVersion'

type GovernanceConfigFormV2 = BaseGovernanceFormFieldsV2 & {
  title: string
  description: string
}

type Props = {
  closeProposalModal: () => void
  isProposalModalOpen: boolean
  governance: ProgramAccount<Governance>
}

const GovernanceConfigModalV2 = ({
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
  const defaultCfgTitle = 'Change governance config'
  const [formErrors, setFormErrors] = useState({})
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)

  const [form, setForm] = useState<GovernanceConfigFormV2 | undefined>()

  useEffect(() => {
    if (config === undefined) return

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
  }, [config, mint])

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form!, [propertyName]: value })
  }
  const schema = yup.object().shape({})
  const handleCreate = async () => {
    if (form === undefined) return

    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (isValid && governance?.account && wallet?.publicKey && realm) {
      setCreatingProposal(true)
      const governanceConfigValues = {
        _programVersion: 2,
        minTokensToCreateProposal: form!.minCommunityTokensToCreateProposal,
        minInstructionHoldUpTime: form!.minInstructionHoldUpTime,
        maxVotingTime: form!.maxVotingTime,
        voteThresholdPercentage: form!.voteThreshold,
        mintDecimals: mint!.decimals,
        voteTipping: form.voteTipping,
      } as const

      const governanceConfig = getGovernanceConfig(
        realmInfo?.programVersion!,
        governanceConfigValues
      )
      const instruction = await createSetGovernanceConfig(
        realm.owner,
        realmInfo?.programVersion!,
        governance?.pubkey,
        governanceConfig
      )
      serializedInstruction = serializeInstructionToBase64(instruction)
      const obj: UiInstruction = {
        serializedInstruction: serializedInstruction,
        isValid,
        governance,
      }
      const instructionData = new InstructionDataWithHoldUpTime({
        instruction: obj,
        governance,
      })
      try {
        const proposalAddress = await handleCreateProposal({
          title: form!.title ? form!.title : defaultCfgTitle,
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
      <div className="w-full space-y-4">
        <h3 className="flex flex-col mb-4">
          Change Governance Config:{' '}
          {governance && abbreviateAddress(governance.pubkey)}
        </h3>
        <Input
          label="Title"
          placeholder={defaultCfgTitle}
          value={form?.title}
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
    </Modal>
  )
}

const GovernanceConfigModalV3 = ({
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
  const defaultCfgTitle = 'Change governance config'
  const [formErrors, setFormErrors] = useState({})
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)

  const [form, setForm] = useState<GovernanceConfigFormV2 | undefined>()

  useEffect(() => {
    if (config === undefined) return

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
  }, [config, mint])

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form!, [propertyName]: value })
  }
  const schema = yup.object().shape({})
  const handleCreate = async () => {
    if (form === undefined) return

    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (isValid && governance?.account && wallet?.publicKey && realm) {
      setCreatingProposal(true)
      const governanceConfigValues = {
        _programVersion: 2,
        minTokensToCreateProposal: form!.minCommunityTokensToCreateProposal,
        minInstructionHoldUpTime: form!.minInstructionHoldUpTime,
        maxVotingTime: form!.maxVotingTime,
        voteThresholdPercentage: form!.voteThreshold,
        mintDecimals: mint!.decimals,
        voteTipping: form.voteTipping,
      } as const

      const governanceConfig = getGovernanceConfig(
        realmInfo?.programVersion!,
        governanceConfigValues
      )
      const instruction = await createSetGovernanceConfig(
        realm.owner,
        realmInfo?.programVersion!,
        governance?.pubkey,
        governanceConfig
      )
      serializedInstruction = serializeInstructionToBase64(instruction)
      const obj: UiInstruction = {
        serializedInstruction: serializedInstruction,
        isValid,
        governance,
      }
      const instructionData = new InstructionDataWithHoldUpTime({
        instruction: obj,
        governance,
      })
      try {
        const proposalAddress = await handleCreateProposal({
          title: form!.title ? form!.title : defaultCfgTitle,
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
      <div className="w-full space-y-4">
        <h3 className="flex flex-col mb-4">
          Change Governance Config:{' '}
          {governance && abbreviateAddress(governance.pubkey)}
        </h3>
        <Input
          label="Title"
          placeholder={defaultCfgTitle}
          value={form?.title}
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
    </Modal>
  )
}

const GovernanceConfigModal = (props: Props) => {
  const programVersion = useProgramVersion()
  return programVersion === 3 ? (
    <GovernanceConfigModalV3 {...props} />
  ) : (
    <GovernanceConfigModalV2 {...props} />
  )
}

export default GovernanceConfigModal
