import React, { useContext, useEffect, useState } from 'react'
import * as yup from 'yup'
import {
  ComponentInstructionData,
  EmptyInstructionForm,
  Instructions,
  UiInstruction,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { Governance } from '@models/accounts'
import { ParsedAccount } from '@models/core/accounts'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { validateInstruction } from '@utils/instructionTools'
import TokenBalanceCard from '@components/TokenBalanceCard'
import Input from '@components/inputs/Input'
import Button from '@components/Button'
import useRealm from '@hooks/useRealm'
import { NewProposalContext } from '../new'
import GovernedAccountSelect from '../components/GovernedAccountSelect'
import VoteBySwitch from '../components/VoteBySwitch'
import { ArrowCircleDownIcon, PlusCircleIcon } from '@heroicons/react/outline'
import AddMemberIcon from '@components/AddMemberIcon'

export interface NoneInstructions extends EmptyInstructionForm {
  title?: string
  description?: string
}

const Empty = ({
  index,
  governance,
  setGovernance,
}: {
  index: number
  governance: ParsedAccount<Governance> | null
  setGovernance: any
}) => {
  const {
    governancesArray,
    governedTokenAccounts,
    getMintWithGovernances,
  } = useGovernanceAssets()
  const { canChooseWhoVote } = useRealm()
  const shouldBeGoverned = index !== 0 && governance
  const [showOptions, setShowOptions] = useState(false)
  const [governedAccounts, setGovernedAccounts] = useState<
    GovernedMultiTypeAccount[]
  >([])
  const [form, setForm] = useState<NoneInstructions>({
    governedAccount: undefined,
    title: '',
    description: '',
  })
  const [formErrors, setFormErrors] = useState({})
  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: Instructions.None }])
  const [voteByCouncil, setVoteByCouncil] = useState(false)
  const handleSetForm = ({ propertyName, value }) => {
    setFormErrors({})
    setForm({ ...form, [propertyName]: value })
  }
  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  useEffect(() => {
    async function prepGovernances() {
      const mintWithGovernances = await getMintWithGovernances()
      const matchedGovernances = governancesArray.map((gov) => {
        const governedTokenAccount = governedTokenAccounts.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        const mintGovernance = mintWithGovernances.find(
          (x) => x.governance?.pubkey.toBase58() === gov.pubkey.toBase58()
        )
        if (governedTokenAccount) {
          return governedTokenAccount as GovernedMultiTypeAccount
        }
        if (mintGovernance) {
          return mintGovernance as GovernedMultiTypeAccount
        }
        return {
          governance: gov,
        }
      })
      setGovernedAccounts(matchedGovernances)
    }
    prepGovernances()
  }, [])
  async function getInstruction(): Promise<UiInstruction> {
    const isValid = await validateInstruction({ schema, form, setFormErrors })
    const obj: UiInstruction = {
      serializedInstruction: '',
      isValid,
      governance: form.governedAccount?.governance,
    }
    return obj
  }

  useEffect(() => {
    handleSetInstructions(
      { governedAccount: form.governedAccount?.governance, getInstruction },
      index
    )
  }, [form])
  const schema = yup.object().shape({
    governedAccount: yup
      .object()
      .nullable()
      .required('Governed account is required'),
  })
  return (
    <NewProposalContext.Provider
      value={{
        instructionsData,
        handleSetInstructions,
        governance,
        setGovernance,
      }}
    >
      <div className="w-full flex flex-col justify-between items-start">
        <div className="flex justify-start items-center gap-x-3 mb-8">
          <PlusCircleIcon className="w-8 mb-2" />

          <h2 className="text-xl">No instructions - Vote only</h2>
        </div>

        <GovernedAccountSelect
          noMaxWidth
          useDefaultStyle={false}
          className="p-2 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
          label="Governance"
          governedAccounts={governedAccounts}
          onChange={(value) => {
            handleSetForm({ value, propertyName: 'governedAccount' })
          }}
          value={form.governedAccount}
          error={formErrors['governedAccount']}
          shouldBeGoverned={shouldBeGoverned}
          governance={governance}
        />

        <div
          className="flex items-center hover:cursor-pointer w-24 my-4"
          onClick={() => setShowOptions(!showOptions)}
        >
          {showOptions ? (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          ) : (
            <ArrowCircleDownIcon className="h-4 w-4 mr-1 text-primary-light" />
          )}
          <small className="text-fgd-3">Options</small>
        </div>

        {showOptions && (
          <div className="mb-8 w-full">
            <Input
              noMaxWidth
              useDefaultStyle={false}
              className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
              wrapperClassName="mb-6 w-full"
              label="Title of your proposal"
              placeholder="Title of your proposal (optional)"
              value={form.title || 'Vote only proposal'}
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
              className="p-4 w-full bg-bkg-3 border border-bkg-3 default-transition text-sm text-fgd-1 rounded-md focus:border-bkg-3 focus:outline-none max-w-xl"
              wrapperClassName="mb-6 w-full"
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

            <VoteBySwitch
              disabled={!canChooseWhoVote}
              checked={voteByCouncil}
              onChange={() => {
                setVoteByCouncil(!voteByCouncil)
              }}
            />
          </div>
        )}

        <Button
          className="w-44 flex justify-center items-center"
          // onClick={handlePropose}
          // isLoading={isLoading}
          // disabled={isLoading}
        >
          Create proposal
        </Button>
      </div>
    </NewProposalContext.Provider>
  )
}

export default Empty
