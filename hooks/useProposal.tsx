import { useRouter } from 'next/router'
import useWalletStore from '../stores/useWalletStore'

export default function useProposal() {
  const router = useRouter()
  const { pk } = router.query

  const { proposal, description, instructions, proposalMint } = useWalletStore(
    (s) => s.selectedProposal
  )

  return {
    pk,
    proposal,
    description,
    instructions,
    proposalMint,
  }
}
