import useRealm from '@hooks/useRealm'
import { getVoteRecordAddress } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/router'

export const useAddressQuery_SelectedProposalVoteRecord = (
  tokenOwnerRecordAddress?: PublicKey
) => {
  const router = useRouter()
  const { pk } = router.query
  const { realm } = useRealm()

  const programId = realm?.owner // TODO make me cached plz
  const proposalAddress = typeof pk === 'string' ? new PublicKey(pk) : undefined

  return useAddressQuery_VoteRecord(
    programId,
    proposalAddress,
    tokenOwnerRecordAddress
  )
}

export const useAddressQuery_VoteRecord = (
  programId?: PublicKey,
  proposalAddress?: PublicKey,
  tokenOwnerRecordAddress?: PublicKey
) => {
  const enabled =
    programId !== undefined &&
    typeof proposalAddress === 'string' &&
    tokenOwnerRecordAddress !== undefined

  return useQuery({
    queryKey: enabled
      ? [
          'VoteRecordAddress',
          [programId, proposalAddress, tokenOwnerRecordAddress],
        ]
      : undefined,
    queryFn: () => {
      if (enabled)
        return getVoteRecordAddress(
          programId,
          new PublicKey(proposalAddress),
          tokenOwnerRecordAddress
        )
      else throw new Error()
    },
    enabled,
    // Staletime is zero by default, so queries get refetched often. PDAs will never go stale.
    staleTime: Number.MAX_SAFE_INTEGER,
  })
}
