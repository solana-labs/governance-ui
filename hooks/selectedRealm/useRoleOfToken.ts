import { PublicKey } from '@solana/web3.js'
import { useRealmQuery } from '../queries/realm'

const useRoleOfGovToken = (mint?: PublicKey) => {
  const realm = useRealmQuery().data?.result
  const role =
    realm === undefined || mint === undefined
      ? undefined
      : realm.account.communityMint.equals(mint)
      ? 'community'
      : realm.account.config.councilMint?.equals(mint)
      ? 'council'
      : 'not found'
  return role
}

export default useRoleOfGovToken
