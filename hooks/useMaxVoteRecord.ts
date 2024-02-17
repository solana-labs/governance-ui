import { useMemo } from 'react'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'

// TODO QV-2 remove this and get the data from the new hook
export const useMaxVoteRecord = () => {
  const nftMaxVoteRecord = useNftPluginStore((s) => s.state.maxVoteRecord)
  const heliumMaxVoteRecord = useHeliumVsrStore((s) => s.state.maxVoteRecord)
  const maxVoteWeightRecord: ProgramAccount<MaxVoterWeightRecord> | null = useMemo(
    () => nftMaxVoteRecord || heliumMaxVoteRecord || null,
    [nftMaxVoteRecord, heliumMaxVoteRecord]
  )

  return maxVoteWeightRecord
}
