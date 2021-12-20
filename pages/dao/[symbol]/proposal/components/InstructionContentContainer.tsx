import {
  ComponentInstructionData,
  Instructions,
} from '@utils/uiTypes/proposalCreationTypes'
import React from 'react'
import DryRunInstructionBtn from './DryRunInstructionBtn'

const InstructionContentContainer = ({
  children,
  idx,
  instructionsData,
}: {
  children: any
  idx: number
  instructionsData: ComponentInstructionData[]
}) => {
  const currentInstruction = instructionsData ? instructionsData[idx] : null

  return (
    <div className="space-y-4 w-full">
      {children}

      {currentInstruction?.type?.id !== Instructions.None && (
        <DryRunInstructionBtn
          btnClassNames=""
          getInstructionDataFcn={currentInstruction?.getInstruction}
        />
      )}
    </div>
  )
}

export default InstructionContentContainer
