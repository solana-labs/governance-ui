import { useState, useEffect } from 'react'
import { Program } from '@project-serum/anchor'
import { VoterStakeRegistry as HeliumVoterStakeRegistry } from '@helium/idls/lib/types/voter_stake_registry'
import { init } from '@helium/voter-stake-registry-sdk'
import useWallet from '@hooks/useWallet'

export const useHeliumVsr = () => {
  const [
    program,
    setProgram,
  ] = useState<Program<HeliumVoterStakeRegistry> | null>(null)
  const { anchorProvider } = useWallet()

  useEffect(() => {
    //@ts-ignore
    init(anchorProvider)
      //@ts-ignore
      .then((prog) => setProgram(prog))
      .catch(console.error)
  }, [anchorProvider])

  return program
}
