import { useRouteProposalQuery } from './queries/proposal'
import { useGovernanceByPubkeyQuery } from './queries/governance'

export const useProposalGovernanceQuery = () => {
  const proposal = useRouteProposalQuery().data?.result
  return useGovernanceByPubkeyQuery(proposal?.account.governance)
}
