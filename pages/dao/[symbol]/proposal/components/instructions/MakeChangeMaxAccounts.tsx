import React, { useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import * as yup from 'yup'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  MangoMakeChangeMaxAccountsTypeForm,
  ComponentInstructionData,
  Instructions,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import {
  Governance,
  GovernanceAccountType,
  ProgramAccount,
  serializeInstructionToBase64,
} from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'
import Input from '@components/inputs/Input'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { makeChangeMaxMangoAccountsInstruction } from '@blockworks-foundation/mango-client'
import { BN } from '@project-serum/anchor'
import TokenBalanceCard from '@components/TokenBalanceCard'
import Button from '@components/Button'
import { handlePropose } from 'actions/handleCreateProposal'
import { NewProposalContext } from '../../new'
import GovernedAccountSelect from '../GovernedAccountSelect'

const MakeChangeMaxAccounts = ({
  index,
  governance,
  setGovernance,
  callback,
}: {
  index: number
  governance: ProgramAccount<Governance> | null
  setGovernance: any
  callback: any
}) => {
  const wallet = useWalletStore((s) => s.current)
  const connection = useWalletStore((s) => s.connection)
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)

  const [isLoading, setIsLoading] = useState(false)

  const realmData = useRealm()

  const { realmInfo } = realmData

  const { getGovernancesByAccountType } = useGovernanceAssets()

  const governedProgramAccounts = getGovernancesByAccountType(
    GovernanceAccountType.ProgramGovernance
  ).map((x) => {
    return {
      governance: x,
    }
  })

  const shouldBeGoverned = index !== 0 && governance
  const programId: PublicKey | undefined = realmInfo?.programId

  const [form, setForm] = useState<MangoMakeChangeMaxAccountsTypeForm>({
    governedAccount: undefined,
    programId: programId?.toString(),
    mangoGroupKey: undefined,
    maxMangoAccounts: 1,
    description: '',
    title: '',
  })

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.MangoMakeChangeMaxAccounts }])

  const [formErrors, setFormErrors] = useState({})

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const schema = yup.object().shape({
    bufferAddress: yup.number(),
    governedAccount: yup
      .object()
      .nullable()
      .required('Program governed account is required'),
  })

  const validateInstruction = async (): Promise<boolean> => {
    const { isValid, validationErrors } = await isFormValid(schema, form)

    setFormErrors(validationErrors)

    return isValid
  }

  const getInstruction = async (): Promise<UiInstruction[]> => {
    const instructions: UiInstruction[] = []

    const isValid = await validateInstruction()

    let serializedInstruction = ''

    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.account &&
      wallet?.publicKey
    ) {
      //Mango instruction call and serialize
      const setMaxMangoAccountsInstr = makeChangeMaxMangoAccountsInstruction(
        form.governedAccount.governance.account.governedAccount,
        new PublicKey(form.mangoGroupKey!),
        form.governedAccount.governance.pubkey,
        new BN(form.maxMangoAccounts)
      )

      serializedInstruction = serializeInstructionToBase64(
        setMaxMangoAccountsInstr
      )
    }

    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }

    instructions.push(obj)

    return instructions
  }

  const getSelectedGovernance = async () => {
    return (await fetchRealmGovernance(
      form.governedAccount?.governance?.pubkey
    )) as ProgramAccount<Governance>
  }

  const confirmPropose = async () => {
    return await handlePropose({
      getInstruction,
      form,
      schema,
      connection,
      callback,
      governance: form.governedAccount?.governance,
      realmData,
      wallet,
      getSelectedGovernance,
      setIsLoading,
    })
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])

  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full flex lg:flex-row flex-col justify-between items-start">
        <div className="w-full flex lg:mb-0 mb-20 flex-col gap-y-5 justify-start items-start lg:max-w-xl rounded-xl">
          <GovernedAccountSelect
            noMaxWidth
            useDefaultStyle={false}
            className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            label="Program"
            governedAccounts={
              governedProgramAccounts as GovernedMultiTypeAccount[]
            }
            onChange={(value) => {
              handleSetForm({ value, propertyName: 'governedAccount' })
            }}
            value={form.governedAccount}
            error={formErrors['governedAccount']}
            shouldBeGoverned={shouldBeGoverned}
            governance={governance}
          />

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="my-6 w-full"
            label="Mango group key"
            placeholder="Mango group key"
            value={form.mangoGroupKey}
            type="text"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'mangoGroupKey',
              })
            }
            error={formErrors['mangoGroupKey']}
          />

          <Input
            noMaxWidth
            useDefaultStyle={false}
            className="p-4 w-fullb bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
            wrapperClassName="mb-6 w-full"
            label="Max accounts"
            value={form.maxMangoAccounts}
            type="number"
            min={1}
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'maxMangoAccounts',
              })
            }
            error={formErrors['maxMangoAccounts']}
          />

          <Button
            className="w-44 flex justify-center items-center mt-8"
            onClick={confirmPropose}
            disabled={
              !form.mangoGroupKey ||
              isLoading ||
              !form.governedAccount ||
              !form.maxMangoAccounts
            }
          >
            Create proposal
          </Button>
        </div>

        <div className="lg:max-w-xs max-w-xl w-full">
          <Input
            noMaxWidth
            useDefaultStyle
            wrapperClassName="mb-6"
            label="Title of your proposal"
            placeholder="Title of your proposal (optional)"
            value={form.title || 'Mango - Change max accounts'}
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

export default MakeChangeMaxAccounts
