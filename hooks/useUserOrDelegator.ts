import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import useWalletOnePointOh from './useWalletOnePointOh'

export default function () {
  const wallet = useWalletOnePointOh()
  const selectedCommunityDelegator = useSelectedDelegatorStore(
    (s) => s.communityDelegator
  )

  // if we have a community token delegator selected (this is rare), use that. otherwise use user wallet.
  const owner =
    selectedCommunityDelegator !== undefined
      ? selectedCommunityDelegator
      : // I wanted to eliminate `null` as a possible type
        wallet?.publicKey ?? undefined
  return owner
}
