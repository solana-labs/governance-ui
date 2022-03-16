import { PublicKey } from '@solana/web3.js'
import useRealm from 'hooks/useRealm'
import Input from 'components/inputs/Input'
import Button, { SecondaryButton } from '@components/Button'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { abbreviateAddress, precision } from 'utils/formatting'
import useWalletStore from 'stores/useWalletStore'
import { getMintSchema } from 'utils/validations'
import { useEffect, useState } from 'react'
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
import AddMemberIcon from '@components/AddMemberIcon'
import { getProgramVersionForRealm } from '@models/registry/api'
import {
  ArrowCircleDownIcon,
  ArrowCircleUpIcon,
} from '@heroicons/react/outline'
import useVoteStakeRegistryClientStore from 'VoteStakeRegistry/stores/voteStakeRegistryClientStore'

interface AddMemberForm extends MintForm {
  description: string
  title: string
}

const AddMemberForm = ({ close }) => {
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const router = useRouter()
  const client = useVoteStakeRegistryClientStore((s) => s.state.client)
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

  const [form, setForm] = useState<AddMemberForm>({
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

  const proposalTitle = `Add council member ${
    form.destinationAccount
      ? abbreviateAddress(new PublicKey(form.destinationAccount))
      : ''
  }`

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

    const instruction: UiInstruction = await getInstruction()

    if (instruction.isValid && wallet && realmInfo) {
      const governance = form.mintAccount?.governance

      let proposalAddress: PublicKey | null = null

      if (!realm) {
        setIsLoading(false)

        throw new Error('No realm selected')
      }

      const rpcContext = new RpcContext(
        new PublicKey(realm.owner.toString()),
        getProgramVersionForRealm(realmInfo),
        wallet,
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

        proposalAddress = await createProposal(
          rpcContext,
          realm,
          selectedGovernance.pubkey,
          ownTokenRecord.pubkey,
          form.title ? form.title : proposalTitle,
          form.description ? form.description : '',
          proposalMint,
          selectedGovernance?.account?.proposalCount,
          [instructionData],
          false,
          client
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

        close()
      }
    }

    setIsLoading(false)
  }

  useEffect(() => {
    const initForm = async () => {
      const response = await getMintWithGovernances()

      handleSetForm({
        value: response.find(
          (x) =>
            x.governance?.account.governedAccount.toBase58() ===
            realm?.account.config.councilMint?.toBase58()
        ),
        propertyName: 'mintAccount',
      })
    }

    initForm()
  }, [])

  return (
    <>
      <div className="flex justify-start items-center gap-x-3">
        <AddMemberIcon className="w-8 mb-2" />

        <h2 className="text-xl">Add new member to {realmInfo?.displayName}</h2>
      </div>

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
            value={form.title ? form.title : proposalTitle}
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
            label="Description"
            placeholder="Description of your proposal (optional)"
            value={form.description}
            type="text"
            onChange={(event) =>
              handleSetForm({
                value: event.target.value,
                propertyName: 'description',
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
        </>
      )}

      <div className="flex gap-x-6 justify-end items-center mt-8">
        <SecondaryButton
          disabled={isLoading}
          className="w-44"
          onClick={() => close()}
        >
          Cancel
        </SecondaryButton>

        <Button
          disabled={!form.destinationAccount || isLoading}
          className="w-44 flex justify-center items-center"
          onClick={() => handlePropose()}
        >
          Add proposal
        </Button>
      </div>
    </>
  )
}

export default AddMemberForm
