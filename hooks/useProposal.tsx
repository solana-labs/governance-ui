import { useRouter } from 'next/router'
import useWalletStore from '../stores/useWalletStore'
import { useRouteProposalQuery } from './queries/proposal'

export default function useProposal() {
  const router = useRouter()
  const { pk } = router.query
  const proposal = useRouteProposalQuery().data?.result

  const {
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
