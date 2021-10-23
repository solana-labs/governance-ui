import React from 'react'
import DryRunInstructionBtn from './DryRunInstructionBtn'

const InstructionContainer = ({ children, idx, instructionsData }) => {
  return (
    <div>
      {children}
      <div className="text-right">
        <DryRunInstructionBtn
          btnClassNames="mt-5 "
          getInstructionDataFcn={instructionsData[idx].getInstruction}
        />
      </div>
    </div>
  )
}

export default InstructionContainer
