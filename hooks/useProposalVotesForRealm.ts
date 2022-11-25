import { getProposalMaxVoteWeight } from '@models/voteWeights'
import {
  Governance,
  ProgramAccount,
  Proposal,
  Realm,
} from '@solana/spl-governance'
import { MintInfo } from '@solana/spl-token'
import { calculatePct, fmtTokenAmount } from '@utils/formatting'
import { tryGetMint } from '@utils/tokens'
import { useEffect, useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

type ProposalVotesInfoType = {
  voteThresholdPct: number
  yesVotePct: number
  yesVoteProgress: number
  yesVoteCount: number
  noVoteCount: number
  minimumYesVotes: number
  yesVotesRequired: number
  relativeYesVotes: number
  relativeNoVotes: number
}

const defaultProposalVotes: ProposalVotesInfoType = {
  voteThresholdPct: 100,
  yesVotePct: 0,
  yesVoteProgress: 0,
  yesVoteCount: 0,
  noVoteCount: 0,
  minimumYesVotes: 0,
  yesVotesRequired: 0,
  relativeYesVotes: 0,
  relativeNoVotes: 0,
}

export default function useProposalVotesForRealm(
  realm: ProgramAccount<Realm>,
  proposal: Proposal,
  governance?: ProgramAccount<Governance>
) {
  const connection = useWalletStore((s) => s.connection.current)

  const [proposalVotes, setProposalVotes] = useState<ProposalVotesInfoType>(
    defaultProposalVotes
  )

  const proposalMintKey = useMemo(
    () =>
      proposal.governingTokenMint.toBase58() ===
      realm.account.communityMint.toBase58()
        ? realm.account.communityMint
        : realm.account.config.councilMint,
    [realm, proposal]
  )

  const [proposalMint, setProposalMint] = useState<MintInfo | null>(null)

  useEffect(() => {
    async function fetchProposalMint() {
      if (proposalMintKey) {
        const mintInfo = await tryGetMint(connection, proposalMintKey)
        if (mintInfo) setProposalMint(mintInfo.account)
      } else setProposalMint(null)
    }
    console.log("[serum_gov]: fetching proposal's mint")
    fetchProposalMint()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [proposalMintKey?.toBase58()])

  useEffect(() => {
    function calculateProposalVotes() {
      if (!governance || !proposalMint) return defaultProposalVotes

      const maxVoteWeight = getProposalMaxVoteWeight(
        realm.account,
        proposal,
        proposalMint
      )
      const voteThresholdPct =
        (proposal.isVoteFinalized() && proposal.voteThreshold?.value) ||
        governance.account.config.communityVoteThreshold.value!

      const minimumYesVotes =
        fmtTokenAmount(maxVoteWeight, proposalMint.decimals) *
        (voteThresholdPct / 100)

      const yesVotePct = calculatePct(proposal.getYesVoteCount(), maxVoteWeight)
      const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100
      const isMultiProposal = proposal.options?.length > 1
      const yesVoteCount = !isMultiProposal
        ? fmtTokenAmount(proposal.getYesVoteCount(), proposalMint.decimals)
        : 0
      const noVoteCount = !isMultiProposal
        ? fmtTokenAmount(proposal.getNoVoteCount(), proposalMint.decimals)
        : 0

      const totalVoteCount = yesVoteCount + noVoteCount

      const getRelativeVoteCount = (voteCount: number) =>
        totalVoteCount === 0 ? 0 : (voteCount / totalVoteCount) * 100

      const relativeYesVotes = getRelativeVoteCount(yesVoteCount)
      const relativeNoVotes = getRelativeVoteCount(noVoteCount)

      const rawYesVotesRequired = minimumYesVotes - yesVoteCount
      const yesVotesRequired =
        proposalMint.decimals == 0
          ? Math.ceil(rawYesVotesRequired)
          : rawYesVotesRequired

      return {
        voteThresholdPct,
        yesVotePct,
        yesVoteProgress,
        yesVoteCount,
        noVoteCount,
        relativeYesVotes,
        relativeNoVotes,
        minimumYesVotes,
        yesVotesRequired,
      }
    }
    setProposalVotes(calculateProposalVotes())
    // eslint-disable-next-line react-hooks/exhaustive-deps -- TODO please fix, it can cause difficult bugs. You might wanna check out https://bobbyhadz.com/blog/react-hooks-exhaustive-deps for info. -@asktree
  }, [governance, proposal, proposalMint])

  return proposalVotes
}
