import { Instructions } from '@utils/uiTypes/proposalCreationTypes'
import React from 'react'
import DryRunInstructionBtn from '../DryRunInstructionBtn'

const ContentContainer = ({
  children,
  currentInstruction,
}: {
  children: any
  currentInstruction: any
}) => {
  return (
    <div className="w-full">
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

export default ContentContainer
