import { useEffect } from 'react'
import useWalletStore from '../stores/useWalletStore'

export default function useProposal(proposalPk: string) {
  const { fetchProposal } = useWalletStore((s) => s.actions)
  const { proposal, description, instructions, proposalMint } = useWalletStore(
    (s) => s.selectedProposal
  )

  useEffect(() => {
    const fetch = async () => {
      if (proposalPk) {
        await fetchProposal(proposalPk)
      }
    }
    fetch()
  }, [proposalPk])

  return {
    proposal,
    description,
    instructions,
    proposalMint,
  }
}
