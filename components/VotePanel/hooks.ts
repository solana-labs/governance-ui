import { useHasVoteTimeExpired } from '@hooks/useHasVoteTimeExpired'
import useRealm from '@hooks/useRealm'
import { ProposalState, GoverningTokenRole } from '@solana/spl-governance'
import useWalletStore from 'stores/useWalletStore'

export const useIsVoting = () => {
  const { governance, proposal } = useWalletStore((s) => s.selectedProposal)
  const hasVoteTimeExpired = useHasVoteTimeExpired(governance, proposal!)

  const isVoting =
    proposal?.account.state === ProposalState.Voting && !hasVoteTimeExpired
  return isVoting
}

export const useVotingPop = () => {
  const { tokenRole } = useWalletStore((s) => s.selectedProposal)

  const votingPop =
    tokenRole === GoverningTokenRole.Community ? 'community' : 'council'

  return votingPop
}

export const useOwnVoteRecord = () => {
  const { voteRecordsByVoter, tokenRole } = useWalletStore(
    (s) => s.selectedProposal
  )
  const { ownTokenRecord, ownCouncilTokenRecord } = useRealm()
  const wallet = useWalletStore((s) => s.current)

  // If we are using a delegate wallet, use the vote record for the *owner* of the *electoral* TokenOwnerRecord
  // note: this means that your delegated *veto* TokenOwnerRecord may have a different owner, and thus a different VoteRecord.
  const ownVoteRecord =
    tokenRole === GoverningTokenRole.Community && ownTokenRecord
      ? voteRecordsByVoter[
          ownTokenRecord.account.governingTokenOwner.toBase58()
        ]
      : ownCouncilTokenRecord
      ? voteRecordsByVoter[
          ownCouncilTokenRecord.account.governingTokenOwner.toBase58()
        ]
      : wallet?.publicKey && voteRecordsByVoter[wallet.publicKey.toBase58()]

  return ownVoteRecord
}

export const useVoterTokenRecord = () => {
  const { tokenRole } = useWalletStore((s) => s.selectedProposal)
  const { ownTokenRecord, ownCouncilTokenRecord } = useRealm()

  const voterTokenRecord =
    tokenRole === GoverningTokenRole.Community
      ? ownTokenRecord
      : ownCouncilTokenRecord
  return voterTokenRecord
}
