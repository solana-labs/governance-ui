import React from 'react'
import DryRunInstructionBtn from './DryRunInstructionBtn'

const InstructionContainer = ({ children, idx, instructionsData }) => {
  const currentInstruction = instructionsData ? instructionsData[idx] : null
  return (
    <div>
      {children}
      <div className="text-right">
        <DryRunInstructionBtn
          btnClassNames="mt-5 "
          getInstructionDataFcn={currentInstruction?.getInstruction}
        />
      </div>
    </div>
  )
}

export default InstructionContainer
