import { useMemo } from 'react'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'

export const useMaxVoteRecord = () => {
  const nftMaxVoteRecord = useNftPluginStore((s) => s.state.maxVoteRecord)
  const maxVoteWeightRecord: ProgramAccount<MaxVoterWeightRecord> | null = useMemo(
    () => nftMaxVoteRecord || null,
    [nftMaxVoteRecord]
  )

  return maxVoteWeightRecord
}
