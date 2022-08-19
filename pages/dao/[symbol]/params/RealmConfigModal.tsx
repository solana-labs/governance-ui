import { parseMintNaturalAmountFromDecimalAsBN } from '@tools/sdk/units'
import Modal from '@components/Modal'
import Input from '@components/inputs/Input'
import VoteBySwitch from '../proposal/components/VoteBySwitch'
import Textarea from '@components/inputs/Textarea'
import {
  createSetRealmConfig,
  GoverningTokenConfigAccountArgs,
  GoverningTokenType,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import { validateInstruction } from '@utils/instructionTools'
import { getRealmCfgSchema } from '@utils/validations'
import useWalletStore from 'stores/useWalletStore'
import { PublicKey } from '@solana/web3.js'
import { UiInstruction } from '@utils/uiTypes/proposalCreationTypes'
import { parseMintSupplyFraction } from '@utils/tokens'
import useCreateProposal from '@hooks/useCreateProposal'
import { InstructionDataWithHoldUpTime } from 'actions/createProposal'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import useRealm from '@hooks/useRealm'
import { useState } from 'react'
import Button from '@components/Button'
import RealmConfigFormComponent, {
  RealmConfigForm,
} from '../proposal/components/forms/RealmConfigFormComponent'
import { abbreviateAddress } from '@utils/formatting'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { DISABLED_VOTER_WEIGHT } from '@tools/constants'
import { isDisabledVoterWeight } from '@tools/governance/units'

interface RealmConfigProposal extends RealmConfigForm {
  title: string
  description: string
}

const RealmConfigModal = ({ closeProposalModal, isProposalModalOpen }) => {
  const router = useRouter()
  const { realm, mint, canChooseWhoVote, realmInfo, symbol } = useRealm()
  const { assetAccounts } = useGovernanceAssets()

  const realmAuthorityGovernance = assetAccounts.find(
    (x) =>
      x.governance.pubkey.toBase58() === realm?.account.authority?.toBase58()
  )
  const { fmtUrlWithCluster } = useQueryContext()
  const wallet = useWalletStore((s) => s.current)
  const { handleCreateProposal } = useCreateProposal()
  const defaultCfgTitle = 'Change realm config'
  const [formErrors, setFormErrors] = useState({})
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [form, setForm] = useState<RealmConfigProposal>()
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form!, [propertyName]: value })
  }
  const schema = getRealmCfgSchema({ form })
  const handleCreate = async () => {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form!.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      setCreatingProposal(true)
      const governance = form!.governedAccount.governance

      const mintAmount = isDisabledVoterWeight(
        form!.minCommunityTokensToCreateGovernance
      )
        ? DISABLED_VOTER_WEIGHT
        : parseMintNaturalAmountFromDecimalAsBN(
            form!.minCommunityTokensToCreateGovernance!,
            mint!.decimals!
          )
      const instruction = await createSetRealmConfig(
        realmInfo!.programId,
        realmInfo!.programVersion!,
        realm.pubkey,
        realm.account.authority!,
        form?.removeCouncil ? undefined : realm?.account.config.councilMint,
        parseMintSupplyFraction(form!.communityMintSupplyFactor.toString()),
        mintAmount,
        new GoverningTokenConfigAccountArgs({
          voterWeightAddin: form!.communityVoterWeightAddin
            ? new PublicKey(form!.communityVoterWeightAddin)
            : undefined,
          maxVoterWeightAddin: form?.maxCommunityVoterWeightAddin
            ? new PublicKey(form.maxCommunityVoterWeightAddin)
            : undefined,
          tokenType: GoverningTokenType.Liquid,
        }),
        undefined,
        wallet.publicKey
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
      <div className="space-y-4 w-full">
        <h3 className="mb-4 flex flex-col">
          Change Realm Config:{' '}
          {realmAuthorityGovernance &&
            abbreviateAddress(realmAuthorityGovernance!.governance.pubkey)}
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
          className="mb-3"
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
        {realmAuthorityGovernance && (
          <RealmConfigFormComponent
            hideGovSelector={true}
            setForm={setForm}
            setFormErrors={setFormErrors}
            formErrors={formErrors}
            shouldBeGoverned={false}
            governedAccount={realmAuthorityGovernance}
            form={form}
          ></RealmConfigFormComponent>
        )}
      </div>
      <div className="border-t border-fgd-4 flex justify-end mt-6 pt-6 space-x-4">
        <Button
          disabled={creatingProposal}
          isLoading={creatingProposal}
          onClick={() => handleCreate()}
        >
          Add proposal
        </Button>
      </div>
    </Modal>
  )
}

export default RealmConfigModal
