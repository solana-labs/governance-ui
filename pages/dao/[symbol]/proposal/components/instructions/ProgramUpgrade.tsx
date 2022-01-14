import React, { useEffect, useState } from 'react'
import useRealm from '@hooks/useRealm'
import { PublicKey } from '@solana/web3.js'
import { isFormValid } from '@utils/formValidation'
import {
  UiInstruction,
  ComponentInstructionData,
  Instructions,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance, GovernanceAccountType } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import useWalletStore from 'stores/useWalletStore'
import { createUpgradeInstruction } from '@tools/sdk/bpfUpgradeableLoader/createUpgradeInstruction'
import { serializeInstructionToBase64 } from '@models/serialisation'
import Input from '@components/inputs/Input'
import { debounce } from '@utils/debounce'
import { getProgramUpgradeSchema } from '@utils/validations'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { validateInstruction } from '@utils/instructionTools'
import GovernedAccountSelect from '../GovernedAccountSelect'
import TokenBalanceCard from '@components/TokenBalanceCard'
import Button from '@components/Button'
import { handlePropose } from 'actions/handleCreateProposal'
import { NewProposalContext } from '../../new'

export type ProgramUpgradeFormType = {
  governedAccount: any | undefined
  programId: any
  bufferAddress: string
  title?: string
  description?: string
}

const ProgramUpgrade = ({
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
  const wallet = useWalletStore((s) => s.current)

  const [isLoading, setIsLoading] = useState(false)
  const [formErrors, setFormErrors] = useState({})

  const realmData = useRealm()

  const { realmInfo } = realmData
  const { fetchRealmGovernance } = useWalletStore((s) => s.actions)
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

  const [form, setForm] = useState<ProgramUpgradeFormType>({
    governedAccount: undefined,
    programId: programId?.toString(),
    bufferAddress: '',
    title: '',
    description: '',
  })

  const schema = getProgramUpgradeSchema({ form, connection })

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.ProgramUpgrade }])

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }

  const getInstruction = async (): Promise<UiInstruction[]> => {
    const instructions: UiInstruction[] = []

    const isValid = await validateInstruction({ schema, form, setFormErrors })

    let serializedInstruction = ''

    if (
      isValid &&
      programId &&
      form.governedAccount?.governance?.info &&
      wallet?.publicKey
    ) {
      const upgradeIx = await createUpgradeInstruction(
        form.governedAccount.governance.info.governedAccount,
        new PublicKey(form.bufferAddress),
        form.governedAccount.governance.pubkey,
        wallet!.publicKey
      )

      serializedInstruction = serializeInstructionToBase64(upgradeIx)
    }

    const obj: UiInstruction = {
      serializedInstruction: serializedInstruction,
      isValid,
      governance: form.governedAccount?.governance,
    }

    instructions.push(obj)

    return instructions
  }

  useEffect(() => {
    handleSetForm({
      propertyName: 'programId',
      value: programId?.toString(),
    })
  }, [realmInfo?.programId])

  useEffect(() => {
    if (form.bufferAddress) {
      debounce.debounceFcn(async () => {
        const { validationErrors } = await isFormValid(schema, form)

        setFormErrors(validationErrors)
      })
    }
  }, [form.bufferAddress])

  useEffect(() => {
    handleSetInstructions(
      {
        governedAccount: form.governedAccount?.governance,
        getInstruction,
      },
      index
    )
  }, [form])

  const getSelectedGovernance = async () => {
    return (await fetchRealmGovernance(
      form.governedAccount?.governance.pubkey
    )) as ParsedAccount<Governance>
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

  const proposalTitle = `Upgrade program ${form.governedAccount} using ${form.bufferAddress}`

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
            label="Buffer address"
            value={form.bufferAddress}
            type="text"
            placeholder="Buffer address"
            onChange={(evt) =>
              handleSetForm({
                value: evt.target.value,
                propertyName: 'bufferAddress',
              })
            }
            error={formErrors['bufferAddress']}
          />

          <Button
            className="w-44 flex justify-center items-center mt-8"
            onClick={confirmPropose}
            disabled={!form.bufferAddress || isLoading}
          >
            Create proposal
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

export default ProgramUpgrade
