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
import { getConvertToStSolInstruction } from '@utils/instructionTools'
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
import { PublicKey } from '@solana/web3.js'

const defaultFormState = {
  destinationAccount: undefined,
  amount: undefined,
  governedTokenAccount: undefined,
  title: '',
  description: '',
}

const notConnectedMessage =
  'You need to be connected to your wallet to have the ability to create a staking proposal'
const getProposalText = (amount) => {
  return `Convert ${amount} SOL to stSOL`
}

const LIDO_ADDRESS = '49Yi1TKkNyYjPAFdR9LBvoHcUjuPX4Df5T5yv39w2XTn'
const STSOL_MINT = '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj'
export const LIDO_PROGRAM_ID = 'CrX7kMhLC3cSsXJdT7JDgqrRVWGnUpX3gfEfxxU2NVLi'

const LIDO_ADDRESS_DEVNET = '8sqs4Jzs8uq7CEtimhXf32gioVUN3n5Qk65YMkNU5E4F'
const STSOL_MINT_DEVNET = '5nnLCgZn1EQaLj1ub8vYbQgBhkWi97x4JC5ARVPhci4V'
export const LIDO_PROGRAM_ID_DEVNET =
  'CbxVmURN74QZGuFj6qKjM8VDM8b8KKZrbPFLM2CC2hC8'

const ConvertToStSol = () => {
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

  const [formErrors, setFormErrors] = useState({})
  const [stSolTokenAccounts, setStSolTokenAccounts] = useState<AssetAccount[]>(
    []
  )
  const [form, setForm] = useState<StakingViewForm>(defaultFormState)
  const [showOptions, setShowOptions] = useState(false)
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const mintMinAmount = form.governedTokenAccount?.extensions?.mint
    ? getMintMinAmountAsDecimal(
        form.governedTokenAccount.extensions.mint.account
      )
    : 1
  const schema = getStakeSchema({ form })

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const handlePropose = async () => {
    setIsLoading(true)

    let config = {
      lidoAddress: new PublicKey(LIDO_ADDRESS),
      stSolMint: new PublicKey(STSOL_MINT),
      programId: new PublicKey(LIDO_PROGRAM_ID),
    }
    if (connection.cluster === 'devnet') {
      config = {
        lidoAddress: new PublicKey(LIDO_ADDRESS_DEVNET),
        stSolMint: new PublicKey(STSOL_MINT_DEVNET),
        programId: new PublicKey(LIDO_PROGRAM_ID_DEVNET),
      }
    }
    const instruction: UiInstruction = await getConvertToStSolInstruction({
      schema,
      form,
      connection,
      wallet,
      setFormErrors,
      config,
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
          title: form.title ? form.title : getProposalText(form.amount),
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

  useEffect(() => {
    const stSolMint =
      connection.cluster === 'devnet' ? STSOL_MINT_DEVNET : STSOL_MINT
    const stSolAccounts = governedTokenAccounts.filter((acc) => {
      return acc.extensions.mint?.publicKey.toString() === stSolMint
    })
    setStSolTokenAccounts(stSolAccounts)
  }, [connection.cluster])

  return (
    <>
      <h3 className="mb-4 flex items-center">Convert SOL to stSol</h3>
      <AccountLabel />
      <div className="space-y-4 w-full pb-4">
        {stSolTokenAccounts.length > 0 && (
          <GovernedAccountSelect
            label="stSOL Treasury account"
            governedAccounts={stSolTokenAccounts as AssetAccount[]}
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
                  ? getProposalText(form.amount)
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

export default ConvertToStSol
