import { useSelectedDelegatorStore } from 'stores/useSelectedDelegatorStore'
import useWalletOnePointOh from './useWalletOnePointOh'

/** @deprecated it's very suspicious this only cares about community delegator and shud prob not be used / shud take role as input */
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
