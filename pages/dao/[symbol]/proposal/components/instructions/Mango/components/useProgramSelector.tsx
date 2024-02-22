import { useState } from 'react'
import { Program } from './ProgramSelector'

const useProgramSelector = () => {
  const [program, setProgram] = useState<Program>()
  return {
    program,
    setProgram,
  }
}

export default useProgramSelector
