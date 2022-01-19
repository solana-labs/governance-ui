import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
  ArrowLeftIcon,
} from '@heroicons/react/outline'
import { ViewState } from './types'
import useMembersListStore from 'stores/useMembersStore'
import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import Textarea from 'components/inputs/Textarea'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { getMintSchema } from 'utils/validations'
import { useContext, useEffect, useState } from 'react'
import { MintForm, UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import {
  getInstructionDataFromBase64,
  RpcContext,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import { useRouter } from 'next/router'
import { createProposal } from 'actions/createProposal'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { getMintInstruction } from 'utils/instructionTools'
import { getProgramVersionForRealm } from '@models/registry/api'
import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'

interface AddMemberForm extends MintForm {
  description: string
  title: string
}

//Can add only council members for now
const AddMember = ({
  setProposalTitle,
  index,
}: {
  setProposalTitle?: any
  index?: number
}) => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query
  const { setCurrentCompactView, resetCompactViewState } = useMembersListStore()
  const { getMintWithGovernances } = useGovernanceAssets()
  const {
    realmInfo,
    canChooseWhoVote,
    councilMint,
    realm,
    ownVoterWeight,
    mint,
  } = useRealm()
  const { handleSetInstructions } = useContext(NewProposalContext)
  const programId: PublicKey | undefined = realmInfo?.programId
  const [form, setForm] = useState<AddMemberForm>({
    destinationAccount: '',
    amount: 1,
    mintAccount: undefined,
    programId: programId?.toString(),
    description: '',
    title: '',
  })
  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(councilMint!)
    : 1
  const currentPrecision = precision(mintMinAmount)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const proposalTitle = `Add council member ${
    form.destinationAccount ? form.destinationAccount : ''
  }`
  const schema = getMintSchema({ form, connection })

  const setAmount = (event) => {
    const value = event.target.value
    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
  }
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handleGoBackToMainView = async () => {
    setCurrentCompactView(ViewState.MainView)
    resetCompactViewState()
  }

  const validateAmountOnBlur = () => {
    const value = form.amount

    handleSetForm({
      value: parseFloat(
        Math.max(
          Number(mintMinAmount),
          Math.min(Number(Number.MAX_SAFE_INTEGER), Number(value))
        ).toFixed(currentPrecision)
      ),
      propertyName: 'amount',
    })
  }

  async function getInstruction(): Promise<UiInstruction> {
    return getMintInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
    })
  }

  //TODO common handle propose
  const handlePropose = async () => {
    setIsLoading(true)
    const instruction: UiInstruction = await getInstruction()
    if (instruction.isValid) {
      const governance = form.mintAccount?.governance
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
    async function getMintWithGovernancesFcn() {
      const resp = await getMintWithGovernances()
      handleSetForm({
        value: resp.find(
          (x) =>
            x.governance?.account.governedAccount.toBase58() ===
            realm?.account.config.councilMint?.toBase58()
        ),
        propertyName: 'mintAccount',
      })
    }
    getMintWithGovernancesFcn()
  }, [])

  useEffect(() => {
    if (setProposalTitle) {
      setProposalTitle(
        `Add council member ${
          form.destinationAccount ? form.destinationAccount : ''
        }`
      )
    }
  }, [form.destinationAccount, setProposalTitle])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.mintAccount?.governance, getInstruction },
      index
    )
  }, [form])

  return (
    <>
      {setProposalTitle ? (
        <>
          <Input
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="mb-6 w-full"
            label="Member's wallet"
            placeholder="Member's wallet"
            value={form.destinationAccount}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'destinationAccount',
              })
            }
            noMaxWidth
            error={formErrors['destinationAccount']}
          />

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="mb-6 w-full lg:w-1/2"
            min={mintMinAmount}
            label="Voter weight"
            value={form.amount}
            type="number"
            onChange={setAmount}
            step={mintMinAmount}
            error={formErrors['amount']}
            onBlur={validateAmountOnBlur}
          />
        </>
      ) : (
        <>
          <h3 className="mb-4 flex items-center hover:cursor-pointer">
            <>
              <ArrowLeftIcon
                onClick={handleGoBackToMainView}
                className="h-4 w-4 text-primary-light mr-2"
              />
              Add new member
            </>
          </h3>

          <div className="space-y-4">
            <Input
              label="Member's wallet"
              value={form.destinationAccount}
              type="text"
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'destinationAccount',
                })
              }
              noMaxWidth={true}
              error={formErrors['destinationAccount']}
            />
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
                  noMaxWidth
                  label="Proposal Title"
                  placeholder={
                    form.amount && form.destinationAccount
                      ? proposalTitle
                      : 'Title of your proposal'
                  }
                  value={form.title || proposalTitle}
                  type="text"
                  onChange={(evt) =>
                    handleSetForm({
                      value: evt.target.value,
                      propertyName: 'title',
                    })
                  }
                />

                <Textarea
                  noMaxWidth
                  label="Proposal Description"
                  placeholder={
                    'Description of your proposal or use a github gist link (optional)'
                  }
                  value={form.description}
                  onChange={(evt) =>
                    handleSetForm({
                      value: evt.target.value,
                      propertyName: 'description',
                    })
                  }
                />

                <Input
                  noMaxWidth
                  placeholder="Amount"
                  min={mintMinAmount}
                  label="Voter weight"
                  value={form.amount}
                  type="number"
                  onChange={setAmount}
                  step={mintMinAmount}
                  error={formErrors['amount']}
                  onBlur={validateAmountOnBlur}
                />

                <VoteBySwitch
                  disabled={!canChooseWhoVote}
                  checked={voteByCouncil}
                  onChange={() => {
                    setVoteByCouncil(!voteByCouncil)
                  }}
                />
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
              <div>Add proposal</div>
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default AddMember
