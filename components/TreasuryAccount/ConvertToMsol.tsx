import { ArrowCircleDownIcon, ArrowCircleUpIcon } from '@heroicons/react/solid'
import useTreasuryAccountStore from 'stores/useTreasuryAccountStore'
import AccountLabel from './AccountHeader'
import GovernedAccountSelect from 'pages/dao/[symbol]/proposal/components/GovernedAccountSelect'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { useEffect, useState } from 'react'
import {
  StakingViewForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import Input from '@components/inputs/Input'
import Textarea from '@components/inputs/Textarea'
import { precision } from '@utils/formatting'
import useRealm from '@hooks/useRealm'
import VoteBySwitch from 'pages/dao/[symbol]/proposal/components/VoteBySwitch'
import Button from '@components/Button'
import Tooltip from '@components/Tooltip'
import useWalletStore from 'stores/useWalletStore'
import { getStakeSchema } from '@utils/validations'
import { getConvertToMsolInstruction } from '@utils/instructionTools'
import {
  getInstructionDataFromBase64,
  Governance,
  ProgramAccount,
} from '@solana/spl-governance'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import useCreateProposal from '@hooks/useCreateProposal'
import { AssetAccount } from '@utils/uiTypes/assets'

const ConvertToMsol = () => {
  const { canChooseWhoVote, realm, symbol } = useRealm()
  const { canUseTransferInstruction } = useGovernanceAssets()
  const { governedTokenAccounts } = useGovernanceAssets()
  const { fmtUrlWithCluster } = useQueryContext()
  const router = useRouter()
  const { handleCreateProposal } = useCreateProposal()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const currentAccount = useTreasuryAccountStore((s) => s.currentAccount)
  const notConnectedMessage =
    'You need to be connected to your wallet to have the ability to create a staking proposal'

  const [formErrors, setFormErrors] = useState({})
  const [form, setForm] = useState<StakingViewForm>({
    destinationAccount: undefined,
    amount: undefined,
    governedTokenAccount: undefined,
    title: '',
    description: '',
  })
  const [showOptions, setShowOptions] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const mSolTokenAccounts = governedTokenAccounts.filter(
    (acc) =>
      acc.extensions.mint?.publicKey.toString() ===
      'mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So'
  )
  const mintMinAmount = form.governedTokenAccount?.extensions?.mint
    ? getMintMinAmountAsDecimal(
        form.governedTokenAccount.extensions.mint.account
      )
    : 1
  const proposalTitle = `Convert ${form.amount} SOL to mSOL`
  const schema = getStakeSchema({ form })

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handlePropose = async () => {
    setIsLoading(true)
    const instruction: UiInstruction = await getConvertToMsolInstruction({
      schema,
      form,
      connection,
      wallet,
      setFormErrors,
    })

    if (instruction.isValid) {
      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
      }

      const governance = currentAccount?.governance
      const holdUpTime = governance?.account?.config.minInstructionHoldUpTime

      const instructionData = {
        data: instruction.serializedInstruction
          ? getInstructionDataFromBase64(instruction.serializedInstruction)
          : null,
        holdUpTime: holdUpTime,
        prerequisiteInstructions: instruction.prerequisiteInstructions || [],
      }

      try {
        // Fetch governance to get up to date proposalCount
        const selectedGovernance = (await fetchRealmGovernance(
          currentAccount?.governance?.pubkey
        )) as ProgramAccount<Governance>

        const proposalAddress = await handleCreateProposal({
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
      value: currentAccount,
      propertyName: 'governedTokenAccount',
    })
  }, [currentAccount, form.destinationAccount])

  return (
    <>
      <h3 className="mb-4 flex items-center">Convert SOL to mSOL</h3>
      <AccountLabel></AccountLabel>
      <div className="space-y-4 w-full pb-4">
        {mSolTokenAccounts.length > 0 && (
          <GovernedAccountSelect
            label="mSOL Treasury account"
            governedAccounts={mSolTokenAccounts as AssetAccount[]}
            shouldBeGoverned={false}
            governance={currentAccount?.governance}
            value={form.destinationAccount}
            onChange={(evt) =>
              handleSetForm({
                value: evt,
                propertyName: 'destinationAccount',
              })
            }
            error={formErrors['destinationAccount']}
            noMaxWidth={true}
          ></GovernedAccountSelect>
        )}
        <Input
          min={mintMinAmount}
          label="Amount SOL"
          type="number"
          value={form.amount}
          step={mintMinAmount}
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'amount',
            })
          }
          onBlur={(evt) =>
            handleSetForm({
              value: parseFloat(
                Math.max(
                  Number(mintMinAmount),
                  Math.min(
                    Number(Number.MAX_SAFE_INTEGER),
                    Number(evt.target.value)
                  )
                ).toFixed(precision(mintMinAmount))
              ),
              propertyName: 'amount',
            })
          }
          error={formErrors['amount']}
          noMaxWidth={true}
        />
        <div
          className="flex items-center hover:cursor-pointer w-24"
          onClick={() => setShowOptions(!showOptions)}
        >
          <div className="h-4 w-4 mr-1 text-primary-light">
            {showOptions ? <ArrowCircleUpIcon /> : <ArrowCircleDownIcon />}
          </div>
          <small className="text-fgd-3">Options</small>
        </div>
        {showOptions && (
          <>
            <Input
              noMaxWidth={true}
              label="Title"
              value={form.title}
              type="text"
              placeholder={
                form.amount && form.destinationAccount
                  ? proposalTitle
                  : 'Title of your proposal'
              }
              onChange={(evt) =>
                handleSetForm({
                  value: evt.target.value,
                  propertyName: 'title',
                })
              }
            />
            <Textarea
              noMaxWidth={true}
              label="Description"
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
        <Button
          className="ml-auto"
          disabled={!canUseTransferInstruction || isLoading}
          onClick={handlePropose}
          isLoading={isLoading}
        >
          <Tooltip content={!canUseTransferInstruction && notConnectedMessage}>
            Propose
          </Tooltip>
        </Button>
      </div>
    </>
  )
}

export default ConvertToMsol
