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
  tryGetRealmConfig,
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
import useProgramVersion from '@hooks/useProgramVersion'

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
  const connection = useWalletStore((s) => s.connection)
  const { handleCreateProposal } = useCreateProposal()
  const defaultCfgTitle = 'Change realm config'
  const [formErrors, setFormErrors] = useState({})
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [creatingProposal, setCreatingProposal] = useState(false)
  const [form, setForm] = useState<Partial<RealmConfigProposal>>({})
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const programVersion = useProgramVersion()

  const schema = getRealmCfgSchema({ form })
  const handleCreate = async () => {
    // START jank validation
    // @asktree: at the very least we shouldn't run instruction-generating code on undefined inputs.
    if (mint === undefined) throw new Error('mint info is not defined')
    if (realmInfo === undefined) throw new Error('realm info is not defined')
    if (realm?.account.authority === undefined)
      throw new Error('realm.account.authority is not defined')
    if (
      form.communityMintSupplyFactor === undefined ||
      form.minCommunityTokensToCreateGovernance === undefined ||
      form.communityTokenType === undefined ||
      form.councilTokenType === undefined
    ) {
      throw new Error('form is missing required fields')
    }
    // END jank validation

    const isValid = await validateInstruction({ schema, form, setFormErrors })
    let serializedInstruction = ''
    if (
      isValid &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey &&
      realm
    ) {
      setCreatingProposal(true)
      const governance = form.governedAccount.governance

      const mintAmount = isDisabledVoterWeight(
        form.minCommunityTokensToCreateGovernance
      )
        ? DISABLED_VOTER_WEIGHT
        : parseMintNaturalAmountFromDecimalAsBN(
            form.minCommunityTokensToCreateGovernance,
            mint.decimals
          )

      const realmConfig = await tryGetRealmConfig(
        connection.current,
        realmInfo.programId,
        realm.pubkey
      )

      const instruction =
        programVersion === 3
          ? await createSetRealmConfig(
              realmInfo.programId,
              programVersion,
              realm.pubkey,
              realm.account.authority,
              form.removeCouncil ? undefined : realm.account.config.councilMint,
              parseMintSupplyFraction(
                form.communityMintSupplyFactor.toString()
              ),
              mintAmount,
              new GoverningTokenConfigAccountArgs({
                voterWeightAddin: form.communityVoterWeightAddin
                  ? new PublicKey(form.communityVoterWeightAddin)
                  : undefined,
                maxVoterWeightAddin: form.maxCommunityVoterWeightAddin
                  ? new PublicKey(form.maxCommunityVoterWeightAddin)
                  : undefined,
                tokenType: form.communityTokenType.value,
              }),
              new GoverningTokenConfigAccountArgs({
                voterWeightAddin: form.councilVoterWeightAddin
                  ? new PublicKey(form.councilVoterWeightAddin)
                  : undefined,
                maxVoterWeightAddin: form.maxCouncilVoterWeightAddin
                  ? new PublicKey(form.maxCouncilVoterWeightAddin)
                  : undefined,
                tokenType: form.councilTokenType.value,
              }),
              // Pass the payer only if RealmConfigAccount doens't exist and needs to be created
              // TODO: If payer is passed then only the payer can execute the proposal
              //       We should use the DAO Wallet instead, and top it up if there is not enough SOL there
              realmConfig ? wallet.publicKey : undefined
            )
          : await createSetRealmConfig(
              realmInfo.programId,
              programVersion,
              realm.pubkey,
              realm.account.authority,
              form?.removeCouncil
                ? undefined
                : realm?.account.config.councilMint,
              parseMintSupplyFraction(
                form.communityMintSupplyFactor.toString()
              ),
              mintAmount,
              new GoverningTokenConfigAccountArgs({
                voterWeightAddin: form.communityVoterWeightAddin
                  ? new PublicKey(form.communityVoterWeightAddin)
                  : undefined,
                maxVoterWeightAddin: form.maxCommunityVoterWeightAddin
                  ? new PublicKey(form.maxCommunityVoterWeightAddin)
                  : undefined,
                tokenType: GoverningTokenType.Liquid,
              }),
              undefined,
              // Pass the payer only if RealmConfigAccount doens't exist and needs to be created
              // TODO: If payer is passed then only the payer can execute the proposal
              //       We should use the DAO Wallet instead, and top it up if there is not enough SOL there
              realmConfig ? wallet.publicKey : undefined
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
          title: form.title ? form.title : defaultCfgTitle,
          description: form.description ? form.description : '',
          voteByCouncil,
          instructionsData: [instructionData],
          governance: governance,
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
            abbreviateAddress(realmAuthorityGovernance.governance.pubkey)}
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
        />
        {canChooseWhoVote && (
          <VoteBySwitch
            checked={voteByCouncil}
            onChange={() => {
              setVoteByCouncil(voteByCouncil)
            }}
          />
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
          />
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
