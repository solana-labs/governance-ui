import { useRouter } from 'next/router'
import useWalletStore from '../stores/useWalletStore'
import { useRouteProposalQuery } from './queries/proposal'
import { useGovernanceByPubkeyQuery } from './queries/governance'

export default function useProposal() {
  const router = useRouter()
  const { pk } = router.query

  const { instructions } = useWalletStore((s) => s.selectedProposal)

  return {
    pk,
    //proposal,
    instructions,
    //proposalMint,
    //governance,
    //proposalOwner,
  }
}

export const useProposalGovernanceQuery = () => {
  const proposal = useRouteProposalQuery().data?.result
  return useGovernanceByPubkeyQuery(proposal?.account.governance)
}
