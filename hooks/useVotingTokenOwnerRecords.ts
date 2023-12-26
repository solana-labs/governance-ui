import { useCallback } from 'react'
import { useTokenOwnerRecordsDelegatedToUser } from './queries/tokenOwnerRecord'
import { useRealmQuery } from './queries/realm'
import useWalletOnePointOh from './useWalletOnePointOh'
import { getTokenOwnerRecordAddress } from '@solana/spl-governance'

/**
 * This returns any token owner record that should be used when the user votes
 * Namely, this would be the user + any delegates that are enabled (by default, they all are)
 */
const useVotingTokenOwnerRecords = () => {
  const delegated = useTokenOwnerRecordsDelegatedToUser()
  const realm = useRealmQuery().data?.result
  const wallet = useWalletOnePointOh()

  // in the future, this information could be retrieved more lazily, so i'm making the output a callback
  const f = useCallback(
    async (governingTokenRole: 'community' | 'council') => {
      if (!wallet?.publicKey) throw new Error()

      // TODO fetch in body
      if (realm === undefined)
        throw new Error(
          'realm not yet fetched; the fetch should really be in the body of this fn'
        )

      // TODO fetch in body
      if (delegated === undefined)
        throw new Error(
          'delegators not yet fetched; the fetch should really be in the body of this fn'
        )

      const governingTokenMint =
        governingTokenRole === 'community'
          ? realm.account.communityMint
          : realm.account.config.councilMint
      if (governingTokenMint === undefined)
        throw new Error('governing token mint not found for role')

      const relevantDelegatedPks = delegated
        .filter((x) => x.account.governingTokenMint.equals(governingTokenMint))
        .map((x) => x.pubkey)

      // UX choice: I decided to make the user vote with their own wallet even if there is a selected delegator
      const userTorPk = await getTokenOwnerRecordAddress(
        realm.owner,
        realm.pubkey,
        governingTokenMint,
        wallet?.publicKey
      )

      return [userTorPk, ...relevantDelegatedPks]
    },
    [delegated, realm, wallet?.publicKey]
  )

  return f
}

export default useVotingTokenOwnerRecords
