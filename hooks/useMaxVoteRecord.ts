import { useState, useEffect } from 'react'
import { MaxVoterWeightRecord, ProgramAccount } from '@solana/spl-governance'
import useNftPluginStore from 'NftVotePlugin/store/nftPluginStore'
import useHeliumVsrStore from 'HeliumVotePlugin/hooks/useHeliumVsrStore'

export const useMaxVoteRecord = () => {
  const [
    maxVoteWeightRecord,
    setMaxVoteWeightRecord,
  ] = useState<ProgramAccount<MaxVoterWeightRecord> | null>(null)

  const nftMaxVoteRecord = useNftPluginStore((s) => s.state.maxVoteRecord)
  const heliumMaxVoteRecord = useHeliumVsrStore((s) => s.state.maxVoteRecord)

  useEffect(() => {
    setMaxVoteWeightRecord(nftMaxVoteRecord || heliumMaxVoteRecord || null)
  }, [nftMaxVoteRecord, heliumMaxVoteRecord])

  return maxVoteWeightRecord
}
