import React, { useEffect, useState } from 'react'
import Input from 'components/inputs/Input'
import useRealm from 'hooks/useRealm'
import { AccountInfo } from '@solana/spl-token'
import { getMintMinAmountAsDecimal } from '@tools/sdk/units'
import { PublicKey } from '@solana/web3.js'
import { precision } from 'utils/formatting'
import { tryParseKey } from 'tools/validators/pubkey'
import useWalletStore from 'stores/useWalletStore'
import {
  GovernedMintInfoAccount,
  GovernedMultiTypeAccount,
  ProgramAccount,
  tryGetTokenAccount,
} from '@utils/tokens'
import {
  UiInstruction,
  Instructions,
  ComponentInstructionData,
} from 'utils/uiTypes/proposalCreationTypes'
import { getAccountName } from 'components/instructions/tools'
import { debounce } from 'utils/debounce'
import { Governance } from 'models/accounts'
import { ParsedAccount } from 'models/core/accounts'
import useGovernanceAssets from 'hooks/useGovernanceAssets'
import { getMintSchema } from 'utils/validations'
import { getMintInstruction } from 'utils/instructionTools'
import GovernedAccountSelect from '../GovernedAccountSelect'
import Button from '@components/Button'
import TokenBalanceCard from '@components/TokenBalanceCard'
import { handlePropose } from 'actions/handleCreateProposal'
import { NewProposalContext } from '../../new'

export type MintTokensForm = {
  destinationAccount: string
  amount: number | undefined
  mintAccount: any
  programId: string | undefined
  title?: string
  description?: string
}

const MintTokens = ({
  index,
  governance,
  setGovernance,
  callback,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
  setGovernance: any
  callback?: any
}) => {
  const connection = useWalletStore((s) => s.connection)
  const realmData = useRealm()

  const { realmInfo } = realmData

  const { getMintWithGovernances } = useGovernanceAssets()
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId

  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState<MintTokensForm>({
    destinationAccount: '',
    // No default mint amount
    amount: undefined,
    mintAccount: undefined,
    programId: programId?.toString(),
    title: '',
    description: '',
  })

  const wallet = useWalletStore((s) => s.current)

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.Mint }])

  const [governedAccount, setGovernedAccount] = useState<
    ParsedAccount<Governance> | undefined
  >(undefined)

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  const [
    destinationAccount,
    setDestinationAccount,
  ] = useState<ProgramAccount<AccountInfo> | null>(null)

  const [formErrors, setFormErrors] = useState({})

  const [
    mintGovernancesWithMintInfo,
    setMintGovernancesWithMintInfo,
  ] = useState<GovernedMintInfoAccount[]>([])

  const mintMinAmount = form.mintAccount
    ? getMintMinAmountAsDecimal(form.mintAccount.mintInfo)
    : 1

  const currentPrecision = precision(mintMinAmount)

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
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

  const getInstruction = async (): Promise<UiInstruction[]> => {
    const instructions: UiInstruction[] = []

    const mintInstruction = await getMintInstruction({
      schema,
      form,
      programId,
      connection,
      wallet,
      governedMintInfoAccount: form.mintAccount,
      setFormErrors,
    })

    instructions.push(mintInstruction)

    return instructions
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    if (form.destinationAccount) {
      debounce.debounceFcn(async () => {
        const pubKey = tryParseKey(form.destinationAccount)
        if (pubKey) {
          const account = await tryGetTokenAccount(connection.current, pubKey)
          setDestinationAccount(account ? account : null)
        } else {
          setDestinationAccount(null)
        }
      })
    } else {
      setDestinationAccount(null)
    }
  }, [form.destinationAccount])

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: governedAccount, getInstruction },
      index
    )
  }, [form, governedAccount])

  useEffect(() => {
    setGovernedAccount(form?.mintAccount?.governance)
  }, [form.mintAccount])

  useEffect(() => {
    async function getMintWithGovernancesFcn() {
      const resp = await getMintWithGovernances()
      setMintGovernancesWithMintInfo(resp)
    }
    getMintWithGovernancesFcn()
  }, [])

  const destinationAccountName =
    destinationAccount?.publicKey &&
    getAccountName(destinationAccount?.account.address)

  const schema = getMintSchema({ form, connection })

  const getSelectedGovernance = async () => {
    return (await fetchRealmGovernance(
      form.mintAccount?.governance?.pubkey
    )) as ParsedAccount<Governance>
  }

  const handleConfirm = async () => {
    return await handlePropose({
      getInstruction,
      form,
      schema,
      connection,
      callback,
      governance: form.mintAccount?.governance,
      realmData,
      wallet,
      getSelectedGovernance,
      setIsLoading,
    })
  }

  const proposalTitle = `Mint ${form.amount ? form.amount : ''} tokens`

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full flex md:flex-row flex-col justify-between items-start">
        <div className="w-full flex md:mb-0 mb-20 flex-col gap-y-5 justify-start items-start md:max-w-xl rounded-xl">
          <GovernedAccountSelect
            label="Mint account"
            noMaxWidth
            useDefaultStyle={false}
            className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            governedAccounts={
              mintGovernancesWithMintInfo as GovernedMultiTypeAccount[]
            }
            onChange={(value) => {
              handleSetForm({ value, propertyName: 'mintAccount' })
            }}
            value={form.mintAccount}
            error={formErrors['mintAccount']}
            shouldBeGoverned={shouldBeGoverned}
            governance={governance}
          />

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="my-6 w-full"
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
            wrapperClassName="mb-6 w-full"
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

          <Button
            className="w-44 flex justify-center items-center mt-8"
            onClick={handleConfirm}
            disabled={
              isLoading ||
              !form.destinationAccount ||
              !form.amount ||
              !form.mintAccount
            }
          >
            Mint tokens
          </Button>
        </div>

        <div className="max-w-xs w-full">
          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="mb-6"
            label="Title of your proposal"
            placeholder="Title of your proposal (optional)"
            value={form.title || proposalTitle}
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
            useDefaultStyle
            wrapperClassName="mb-20"
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

          <TokenBalanceCard />
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default MintTokens
