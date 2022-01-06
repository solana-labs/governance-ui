import useMembersListStore from 'stores/useMembersStore'
import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { getMintSchema } from 'utils/validations'
import { useEffect, useState } from 'react'
import { MintForm, UiInstruction } from 'utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { getInstructionDataFromBase64 } from 'models/serialisation'
import { RpcContext } from 'models/core/api'
import { Governance } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import { useRouter } from 'next/router'
import { createProposal } from 'actions/createProposal'
import { notify } from 'utils/notifications'
import useQueryContext from 'hooks/useQueryContext'
import { getMintInstruction } from 'utils/instructionTools'
import AddMemberIcon from '@components/AddMemberIcon'
import Tooltip from '@components/Tooltip'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import Spinner from '@components/Spinner'

interface AddMemberFormFullScreen extends MintForm {
  description: string
  title: string
}

const AddMemberFormFullScreen = () => {
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})
  const [lastStep, setLastStep] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const { fmtUrlWithCluster } = useQueryContext()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { symbol } = router.query
  const { getMintWithGovernances } = useGovernanceAssets()

  const {
    realmInfo,
    canChooseWhoVote,
    councilMint,
    realm,
    ownVoterWeight,
    mint,
  } = useRealm()

  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<AddMemberFormFullScreen>({
    destinationAccount: '',
    amount: 1,
    mintAccount: undefined,
    programId: programId?.toString(),
    description: '',
    title: '',
  })

  const schema = getMintSchema({ form, connection })

  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(councilMint!)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const proposalTitle = `Add council member ${form.destinationAccount}`

  const defaultProposalMint = !mint?.supply.isZero()
    ? realm?.info.communityMint
    : !councilMint?.supply.isZero()
    ? realm?.info.config.councilMint
    : undefined

  const proposalMint =
    canChooseWhoVote && voteByCouncil
      ? realm?.info.config.councilMint
      : defaultProposalMint

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

  const getInstruction = async (): Promise<UiInstruction> => {
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
    setSubmitted(true)

    const instruction: UiInstruction = await getInstruction()

    if (instruction.isValid) {
      const governance = form.mintAccount?.governance

      let proposalAddress: PublicKey | null = null

      if (!realm) {
        setIsLoading(false)

        throw new Error('No realm selected')
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.account.owner.toString()),
        realmInfo?.programVersion,
        wallet,
        connection.current,
        connection.endpoint
      )

      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: governance?.info?.config.minInstructionHoldUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }

      try {
        const selectedGovernance = (await fetchRealmGovernance(
          governance?.pubkey
        )) as ParsedAccount<Governance>

        const ownTokenRecord = ownVoterWeight.getTokenRecordToCreateProposal(
          governance!.info.config
        )

        const defaultProposalMint = !mint?.supply.isZero()
          ? realm.info.communityMint
          : !councilMint?.supply.isZero()
          ? realm.info.config.councilMint
          : undefined

        const proposalMint =
          canChooseWhoVote && voteByCouncil
            ? realm.info.config.councilMint
            : defaultProposalMint

        if (!proposalMint) {
          throw new Error(
            'There is no suitable governing token for the proposal'
          )
        }

        proposalAddress = await createProposal(
          rpcContext,
          realm.pubkey,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title ? form.title : proposalTitle,
          form.description ? form.description : '',
          proposalMint,
          selectedGovernance?.info?.proposalCount,
          [instructionData],
          false
        )

        const url = fmtUrlWithCluster(
          `/dao/${symbol}/proposal/${proposalAddress}`
        )

        router.push(url)
      } catch (error) {
        notify({
          type: 'error',
          message: `${error}`,
        })
      }

      setIsLoading(false)
    }
  }

  useEffect(() => {
    const initForm = async () => {
      const response = await getMintWithGovernances()

      handleSetForm({
        value: response.find(
          (x) =>
            x.governance?.info.governedAccount.toBase58() ===
            realm?.info.config.councilMint?.toBase58()
        ),
        propertyName: 'mintAccount',
      })
    }

    initForm()
  }, [])

  useEffect(() => {
    console.log('waiting', submitted)
  }, [submitted])

  return (
    <>
      {submitted ? (
        <div className="w-full flex gap-y-5 justify-start items-start max-w-md mt-16 rounded-xl">
          <div className="flex flex-col gap-y-3 justify-center items-center">
            <Spinner className="" />

            <p className="text-base">Creating proposal...</p>

            <p className="text-sm">This can take a few seconds</p>
          </div>

          <div className="w-full mt-16">
            <p>Title: {form.title}</p>
            <p>Description: {form.description}</p>
            <p>Destination account: {form.destinationAccount}</p>
            <p>Amount: {form.amount}</p>
          </div>
        </div>
      ) : (
        <>
          <Input
            useDefaultStyle={false}
            className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
            wrapperClassName="my-6"
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

          <div
            className={'flex items-center hover:cursor-pointer w-24 my-3'}
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
                useDefaultStyle={false}
                className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
                wrapperClassName="mb-6"
                label="Title of your proposal"
                placeholder="Title of your proposal"
                value={form.title}
                type="text"
                onChange={(event) =>
                  handleSetForm({
                    value: event.target.value,
                    propertyName: 'title',
                  })
                }
              />

              <Input
                noMaxWidth
                useDefaultStyle={false}
                className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
                wrapperClassName="mb-6"
                min={mintMinAmount}
                label="Voter weight"
                value={form.amount}
                type="number"
                onChange={setAmount}
                step={mintMinAmount}
                error={formErrors['amount']}
                onBlur={validateAmountOnBlur}
              />

              {canChooseWhoVote && (
                <VoteBySwitch
                  checked={voteByCouncil}
                  onChange={() => {
                    setVoteByCouncil(!voteByCouncil)
                  }}
                />
              )}

              <Input
                noMaxWidth
                useDefaultStyle={false}
                className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none"
                wrapperClassName="mb-6"
                label="Description"
                placeholder="Describe your proposal (optional)"
                value={form.description}
                type="text"
                onChange={(event) =>
                  handleSetForm({
                    value: event.target.value,
                    propertyName: 'description',
                  })
                }
              />
            </>
          )}

          <div className="justify-center flex gap-x-6 items-center mt-8">
            <Button
              disabled={!form.destinationAccount}
              className="w-44 flex justify-center items-center"
              onClick={() => handlePropose()}
              isLoading={isLoading}
            >
              Add member
            </Button>
          </div>
        </>
      )}
    </>
  )
}

export default AddMemberFormFullScreen
