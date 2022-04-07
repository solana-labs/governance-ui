import { LinkButton } from '@components/Button'
import { PlusCircleIcon } from '@heroicons/react/solid'
import { InstructionType } from '@hooks/useGovernanceAssets'
import { GovernedMultiTypeAccount } from '@utils/tokens'
import { ComponentInstructionData } from '@utils/uiTypes/proposalCreationTypes'
import { NewProposalContext } from 'pages/dao/[symbol]/proposal/new'
import { useState } from 'react'
import InstructionForm from './InstructionForm'

const InstructionsForm = ({
  availableInstructions,
  onInstructionsChange,
  governedAccount,
}: {
  availableInstructions: InstructionType[]
  onInstructionsChange: (instructions: ComponentInstructionData[]) => void
  governedAccount?: GovernedMultiTypeAccount
}) => {
  const [instructions, setInstructions] = useState<ComponentInstructionData[]>([
    // One empty instruction at start
    {},
  ])

  const handleSetInstruction = (
    val: Partial<ComponentInstructionData>,
    idx: number
  ) => {
    const newInstructions = [...instructions]
    newInstructions[idx] = { ...instructions[idx], ...val }
    setInstructions(newInstructions)
    onInstructionsChange(newInstructions)
  }

  const setInstructionType = ({
    instructionType,
    idx,
  }: {
    instructionType: InstructionType | null
    idx: number
  }) => {
    handleSetInstruction(
      {
        type: instructionType ? instructionType : undefined,
      },
      idx
    )
  }

  const addInstruction = () => {
    setInstructions([...instructions, { type: undefined }])
  }

  const removeInstruction = (idx: number) => {
    setInstructions([...instructions.filter((x, index) => index !== idx)])
  }

  return (
    <>
      <NewProposalContext.Provider
        value={{
          instructions,
          handleSetInstruction,
        }}
      >
        <h2>Instructions</h2>

        {instructions.map((instruction, idx) => (
          <InstructionForm
            key={idx}
            idx={idx}
            governedAccount={governedAccount}
            selectedInstruction={instruction}
            availableInstructions={availableInstructions}
            setInstructionType={setInstructionType}
            removeInstruction={removeInstruction}
          />
        ))}
      </NewProposalContext.Provider>

      <div className="flex justify-end mt-4 mb-8 px-6">
        <LinkButton
          className="flex font-bold items-center text-fgd-1 text-sm"
          onClick={addInstruction}
        >
          <PlusCircleIcon className="h-5 mr-1.5 text-green w-5" />
          Add instruction
        </LinkButton>
      </div>
    </>
  )
}

export default InstructionsForm
