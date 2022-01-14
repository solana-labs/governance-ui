import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/outline'
import useRealm from '@hooks/useRealm'
import useQueryContext from '@hooks/useQueryContext'
import React, { createContext, useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import {
  ComponentInstructionData,
  InstructionsContext,
} from '@utils/uiTypes/proposalCreationTypes'
import useGovernanceAssets from '@hooks/useGovernanceAssets'
import { ParsedAccount } from '@models/core/accounts'
import { Governance } from '@models/accounts'
import StepOne from './components/instructions/StepOne'
import StepThree from './components/instructions/StepThree'
import StepTwo from './components/instructions/StepTwo'

const defaultGovernanceCtx: InstructionsContext = {
  instructionsData: [],
  handleSetInstructions: () => null,
  governance: null,
  setGovernance: () => null,
}
export const NewProposalContext = createContext<InstructionsContext>(
  defaultGovernanceCtx
)

export type OptionalForm = {
  description?: string
  title?: string
}

const New = () => {
  const { fmtUrlWithCluster } = useQueryContext()
  const { symbol, realmDisplayName } = useRealm()

  const { getAvailableInstructions } = useGovernanceAssets()
  const availableInstructions = getAvailableInstructions()
  const { fetchTokenAccountsForSelectedRealmGovernances } = useWalletStore(
    (s) => s.actions
  )

  const [dataCreation, setDataCreation] = useState<any>(undefined)

  const [
    governance,
    setGovernance,
  ] = useState<ParsedAccount<Governance> | null>(null)

  const [selectedStep, setSelectedStep] = useState(0)

  const [selectedType, setSelectedType] = useState({
    value: '',
    idx: -1,
  })

  const [instructionsData, setInstructions] = useState<
    ComponentInstructionData[]
  >([{ type: availableInstructions[0] }])

  const handleSetInstructions = (val: any, index) => {
    const newInstructions = [...instructionsData]

    newInstructions[index] = { ...instructionsData[index], ...val }

    setInstructions(newInstructions)
  }

  useEffect(() => {
    const firstInstruction = instructionsData[0]

    if (firstInstruction && firstInstruction.governedAccount) {
      setGovernance(firstInstruction.governedAccount)
    }
  }, [instructionsData[0]])

  useEffect(() => {
    setInstructions([instructionsData[0]])
  }, [instructionsData[0].governedAccount?.pubkey])

  useEffect(() => {
    fetchTokenAccountsForSelectedRealmGovernances()
  }, [])

  const steps = {
    0: {
      id: 0,
      title: 'Select type',
      label: 'Step 1',
      disabled: false,
    },
    1: {
      id: 1,
      title: 'Set proposal',
      label: 'Step 2',
      disabled: selectedType.idx === -1,
    },
    2: {
      id: 2,
      title: 'Share your proposal',
      label: 'Step 3',
      disabled: false,
    },
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
      <h1 className="my-3">
        Add a proposal
        {realmDisplayName ? ` to ${realmDisplayName}` : ``}{' '}
      </h1>

      <Link href={fmtUrlWithCluster(`/dao/${symbol}/`)}>
        <a className="flex items-center text-fgd-3 font-bold text-base gap-x-2 transition-all hover:text-fgd-1">
          <ArrowLeftIcon className="h-4 w-4 mr-1 text-primary-light" />
          Realm
        </a>
      </Link>

      <div className="w-full my-8">
        <ul className="flex max-w-2xl border-b border-gray-900">
          {Object.values(steps).map((step) => (
            <div
              onClick={() => setSelectedStep(step.id)}
              key={step.id}
              className={`${
                selectedStep === step.id
                  ? 'border-b-4 border-primary-dark'
                  : selectedStep === 1 && step.id === 0
                  ? 'cursor-pointer opacity-50'
                  : 'opacity-50 pointer-events-none'
              } w-full text-left py-4 leading-5 mx-3 font-bold text-white`}
            >
              <p className="text-primary-dark font-light tracking-widest text-xs">
                {step.label.toUpperCase()}
              </p>

              <p className="text-base sm:block hidden">{step.title}</p>
            </div>
          ))}
        </ul>

        <div
          className={`mt-16 flex md:flex-row flex-col justify-between w-full`}
        >
          {selectedStep === 0 && (
            <StepOne
              handleSetInstructions={handleSetInstructions}
              setSelectedType={setSelectedType}
              setSelectedStep={setSelectedStep}
            />
          )}

          {selectedStep === 1 && (
            <StepTwo
              governance={governance}
              setGovernance={setGovernance}
              selectedType={selectedType}
              setDataCreation={setDataCreation}
              setSelectedStep={setSelectedStep}
            />
          )}

          {selectedStep === 2 && (
            <StepThree
              setSelectedStep={setSelectedStep}
              dataCreation={dataCreation}
            />
          )}
        </div>
      </div>
    </NewProposalContext.Provider>
  )
}

export default New
