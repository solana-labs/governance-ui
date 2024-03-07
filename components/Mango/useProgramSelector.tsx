import { PublicKey } from '@solana/web3.js'
import { useState } from 'react'

type Program = { name: string; val: PublicKey; group: PublicKey }

const useProgramSelector = () => {
  const [program, setProgram] = useState<Program>()
  return {
    program,
    setProgram,
  }
}

export default useProgramSelector
