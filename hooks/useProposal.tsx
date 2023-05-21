import { useRouter } from 'next/router'
import useWalletStore from '../stores/useWalletStore'
import { useRouteProposalQuery } from './queries/proposal'
import { useGovernanceByPubkeyQuery } from './queries/governance'
import { useSelectedProposalTransactions } from './queries/proposalTransaction'

export default function useProposal() {
  const router = useRouter()
  const { pk } = router.query

  return {
    pk,
    //proposal,
    //instructions,
    //proposalMint,
    //governance,
    //proposalOwner,
  }
}

export const useProposalGovernanceQuery = () => {
  const proposal = useRouteProposalQuery().data?.result
  return useGovernanceByPubkeyQuery(proposal?.account.governance)
}
