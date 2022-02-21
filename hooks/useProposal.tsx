import { useRouter } from 'next/router'
import useWalletStore from '../stores/useWalletStore'

export default function useProposal() {
  const router = useRouter()
  const { pk } = router.query

  const {
    proposal,
    descriptionLink,
    instructions,
    proposalMint,
    governance,
    proposalOwner,
  } = useWalletStore((s) => s.selectedProposal)

  return {
    pk,
    proposal,
    descriptionLink,
    instructions,
    proposalMint,
    governance,
    proposalOwner,
  }
}
