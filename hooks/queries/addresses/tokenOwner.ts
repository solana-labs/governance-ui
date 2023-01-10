import useRealm from '@hooks/useRealm'
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'
import { PublicKey } from '@solana/web3.js'
import { useQuery } from '@tanstack/react-query'
import useWalletStore from 'stores/useWalletStore'

export const useAddressQuery_CouncilTokenOwner = () => {
  const { realm } = useRealm()
  const wallet = useWalletStore((x) => x.current)
  const selectedCouncilDelegator = useWalletStore(
    (s) => s.selectedCouncilDelegate
  )

  // if we have a council token delegator selected (this is rare), use that. otherwise use user wallet.
  // eslint-disable-next-line no-extra-boolean-cast
  const owner = !!selectedCouncilDelegator
    ? new PublicKey(selectedCouncilDelegator)
    : wallet?.publicKey ?? undefined

  return useAddressQuery_TokenOwnerRecord(
    realm?.owner,
    realm?.pubkey,
    realm?.account.config.councilMint,
    owner
  )
}

export const useAddressQuery_CommunityTokenOwner = () => {
  const { realm } = useRealm()
  const wallet = useWalletStore((x) => x.current)
  const selectedCommunityDelegator = useWalletStore(
    (s) => s.selectedCommunityDelegate
  )

  // if we have a community token delegator selected (this is rare), use that. otherwise use user wallet.
  // eslint-disable-next-line no-extra-boolean-cast
  const owner = !!selectedCommunityDelegator
    ? new PublicKey(selectedCommunityDelegator)
    : // I wanted to eliminate `null` as a possible type
      wallet?.publicKey ?? undefined

  return useAddressQuery_TokenOwnerRecord(
    realm?.owner,
    realm?.pubkey,
    realm?.account.communityMint,
    owner
  )
}

export const useAddressQuery_TokenOwnerRecord = (
  programId?: PublicKey,
  realmPk?: PublicKey,
  governingTokenMint?: PublicKey,
  owner?: PublicKey
) => {
  const enabled =
    owner !== undefined &&
    governingTokenMint !== undefined &&
    realmPk !== undefined &&
    programId !== undefined

  return useQuery({
    queryKey: enabled
      ? ['TokenOwnerAddress', [programId, realmPk, governingTokenMint, owner]]
      : undefined,
    queryFn: async () => {
      if (!enabled) throw new Error()

      return getTokenOwnerRecordAddress(
        programId,
        realmPk,
        governingTokenMint,
        owner
      )
    },
    enabled,
    // Staletime is zero by default, so queries get refetched often. PDAs will never go stale.
    staleTime: Number.MAX_SAFE_INTEGER,
  })
}
