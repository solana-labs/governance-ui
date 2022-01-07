import React, { useEffect, useState } from 'react'
import Input from '@components/inputs/Input'
import useRealm from '@hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from '@utils/formatting'
import { tryParseKey } from '@tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import {
  GovernedMultiTypeAccount,
  ProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  ComponentInstructionData,
  Instructions,
  SplTokenTransferForm,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import { getAccountName } from '@components/instructions/tools'
import { debounce } from '@utils/debounce'
import { getTokenTransferSchema } from '@utils/validations'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { getTransferInstruction } from '@utils/instructionTools'
import { NewProposalContext } from '../new'
import GovernedAccountSelect from '../components/GovernedAccountSelect'
import Button from '@components/Button'
import { RpcContext } from '@models/core/api'
import { getInstructionDataFromBase64 } from '@models/serialisation'
import { createProposal } from 'actions/createProposal'
import useQueryContext from '@hooks/useQueryContext'
import { useRouter } from 'next/router'
import { notify } from '@utils/notifications'
import VoteBySwitch from '../components/VoteBySwitch'

const TreasuryPaymentFormFullScreen = ({
  index,
  governance,
  setGovernance,
  title,
  description,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
  setGovernance: any
  title?: string
  description?: string
}) => {
  const router = useRouter()
  const connection = useWalletStore((s) => s.connection)
  const wallet = useWalletStore((s) => s.current)

  const {
    realmInfo,
    symbol,
    realm,
    canChooseWhoVote,
    ownVoterWeight,
    mint,
    councilMint,
  } = useRealm()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
  const { governedTokenAccounts } = useGovernanceAssets()
  const { fmtUrlWithCluster } = useQueryContext()

  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const [governedAccount, setGovernedAccount] = useState<
    ParsedAccount<Governance> | undefined
  >(undefined)

  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.Transfer }])

  const programId: PublicKey | undefined = realmInfo?.programId
  const shouldBeGoverned = index !== 0 && governance

  const [form, setForm] = useState<SplTokenTransferForm>({
    destinationAccount: '',
    amount: undefined,
    governedTokenAccount: undefined,
    programId: programId?.toString(),
    mintInfo: undefined,
  })

  const mintMinAmount = form.mintInfo
    ? getMintMinAmountAsDecimal(form.mintInfo)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const setMintInfo = (value) => {
    setForm({ ...form, mintInfo: value })
  }

  const setAmount = (event) => {
    const value = event.target.value

    handleSetForm({
      value: value,
      propertyName: 'amount',
    })
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

  const schema = getTokenTransferSchema({ form, connection })

  const getInstruction = async (): Promise<UiInstruction> => {
    return getTransferInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      currentAccount: form.governedTokenAccount || null,
      setFormErrors,
    })
  }

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })

    handleSetInstructions(
      {
        governedAccount,
        getInstruction,
      },
      index
    )
  }, [realmInfo?.programId])

  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)

        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)

          setDestinationAccount(account ? account : null)

          return
        }

        setDestinationAccount(null)
      })

      return
    }

    setDestinationAccount(null)
  }, [form.destinationAccount])

  useEffect(() => {
    setGovernedAccount(form.governedTokenAccount?.governance)
    setMintInfo(form.governedTokenAccount?.mint?.account)
  }, [form.governedTokenAccount])

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)

  const handlePropose = async () => {
    setIsLoading(true)

    const instruction: UiInstruction = await getInstruction()

    if (instruction.isValid) {
      const governance = form.governedTokenAccount?.governance
      let proposalAddress: PublicKey | null = null

      if (!realm) {
        setIsLoading(false)
        throw 'No realm selected'
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
        // Fetch governance to get up to date proposalCount
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
          title ? title : `Pay ${form.amount} to ${form.destinationAccount}`,
          description
            ? description
            : `Pay ${form.amount} to ${form.destinationAccount}`,
          proposalMint,
          selectedGovernance?.info?.proposalCount,
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

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full">
        <GovernedAccountSelect
          noMaxWidth
          useDefaultStyle={false}
          className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
          label="Source account"
          governedAccounts={governedTokenAccounts as GovernedMultiTypeAccount[]}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'governedTokenAccount' })
          }}
          value={form.governedTokenAccount}
          error={formErrors['governedTokenAccount']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        />

        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
          wrapperClassName="my-6"
          label="Destination account"
          placeholder="Destination account"
          value={form.destinationAccount}
          type="text"
          onChange={(evt) =>
            handleSetForm({
              value: evt.target.value,
              propertyName: 'destinationAccount',
            })
          }
          error={formErrors['destinationAccount']}
        />

        {destinationAccount && (
          <div className="flex justify-start items-center gap-x-2">
            <p className="pb-0.5 text-fgd-3 text-xs">Account owner:</p>
            <p className="text-xs">{form.destinationAccount}</p>
          </div>
        )}

        {destinationAccountName && (
          <div className="flex justify-start items-center gap-x-2">
            <p className="pb-0.5 text-fgd-3 text-xs">Account name:</p>
            <p className="text-xs">{destinationAccountName}</p>
          </div>
        )}

        <Input
          noMaxWidth
          useDefaultStyle={false}
          className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
          wrapperClassName="my-6"
          placeholder="Amount"
          min={mintMinAmount}
          label="Amount"
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
      </div>

      <div className="justify-center flex gap-x-6 items-center mt-8">
        <Button
          className="w-44 flex justify-center items-center"
          onClick={handlePropose}
          isLoading={isLoading}
        >
          Create proposal
        </Button>
      </div>
    </NewProposalContext.Provider>
  )
}

export default TreasuryPaymentFormFullScreen
