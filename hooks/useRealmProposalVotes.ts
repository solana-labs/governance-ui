import { getProposalMaxVoteWeight } from '@models/voteWeights'
import { Governance, Proposal, Realm } from '@solana/spl-governance'
import { calculatePct, fmtTokenAmount } from '@utils/formatting'
import { tryGetMint } from '@utils/tokens'
import { useEffect, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'

const DEFAULT_VOTE = {
  voteThresholdPct: 100,
  yesVotePct: 0,
  yesVoteProgress: 0,
  yesVoteCount: 0,
  noVoteCount: 0,
  minimumYesVotes: 0,
  yesVotesRequired: 0,
}

type UseRealmProposalVoteReturnType = typeof DEFAULT_VOTE

export default function useRealmProposalVotes(
  proposal?: Proposal,
  realm?: Realm,
  governance?: Governance
) {
  const connection = useWalletStore((s) => s.connection)

  const [voteData, setVoteData] = useState<UseRealmProposalVoteReturnType>(
    DEFAULT_VOTE
  )

  useEffect(() => {
    // https://stackoverflow.com/questions/61751728/asynchronous-calls-with-react-usememo
    let active = true
    calculate()
    return () => {
      active = false
    }

    async function calculate() {
      if (!proposal || !realm || !governance) {
        setVoteData(DEFAULT_VOTE)
        return
      }

      const proposalMint =
        proposal.governingTokenMint.toBase58() ===
        realm.communityMint.toBase58()
          ? await tryGetMint(connection.current, realm.communityMint)
          : realm.config.councilMint
          ? await tryGetMint(connection.current, realm.config.councilMint)
          : undefined

      if (!proposalMint) {
        setVoteData(DEFAULT_VOTE)
        return
      }

      const maxVoteWeight = getProposalMaxVoteWeight(
        realm,
        proposal,
        proposalMint.account
      )

      const voteThresholdPct =
        (proposal.isVoteFinalized() && proposal.voteThreshold?.value) ||
        governance.config.communityVoteThreshold.value!

      const minimumYesVotes =
        fmtTokenAmount(maxVoteWeight, proposalMint.account.decimals) *
        (voteThresholdPct / 100)

      const yesVotePct = calculatePct(proposal.getYesVoteCount(), maxVoteWeight)
      const yesVoteProgress = (yesVotePct / voteThresholdPct) * 100

      const isMultiProposal = proposal?.options?.length > 1
      const yesVoteCount = !isMultiProposal
        ? fmtTokenAmount(
            proposal.getYesVoteCount(),
            proposalMint.account.decimals
          )
        : 0
      const noVoteCount = !isMultiProposal
        ? fmtTokenAmount(
            proposal.getNoVoteCount(),
            proposalMint.account.decimals
          )
        : 0

      // const totalVoteCount = yesVoteCount + noVoteCount

      // const getRelativeVoteCount = (voteCount: number) =>
      //   totalVoteCount === 0 ? 0 : (voteCount / totalVoteCount) * 100

      // const relativeYesVotes = getRelativeVoteCount(yesVoteCount)
      // const relativeNoVotes = getRelativeVoteCount(noVoteCount)

      const rawYesVotesRequired = minimumYesVotes - yesVoteCount
      const yesVotesRequired =
        proposalMint.account.decimals == 0
          ? Math.ceil(rawYesVotesRequired)
          : rawYesVotesRequired

      if (!active) return

      setVoteData({
        voteThresholdPct,
        yesVotePct,
        yesVoteProgress,
        yesVoteCount,
        noVoteCount,
        minimumYesVotes,
        yesVotesRequired,
      })
    }
  }, [realm, proposal, governance])

  return voteData
}
