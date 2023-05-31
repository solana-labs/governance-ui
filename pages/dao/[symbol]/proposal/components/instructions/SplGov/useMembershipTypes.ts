import { useRealmQuery } from '@hooks/queries/realm'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { GoverningTokenType } from '@solana/spl-governance'

const useMembershipTypes = () => {
  const realm = useRealmQuery().data?.result
  const config = useRealmConfigQuery().data?.result

  const maybeCouncil =
    realm?.account.config.councilMint &&
    config?.account.councilTokenConfig.tokenType ===
      GoverningTokenType.Membership
      ? ({ council: realm.account.config.councilMint } as const)
      : ({} as const)
  const maybeCommunity =
    realm?.account.communityMint &&
    config?.account.communityTokenConfig.tokenType ===
      GoverningTokenType.Membership
      ? ({ community: realm.account.communityMint } as const)
      : ({} as const)
  return { ...maybeCouncil, ...maybeCommunity } as const
}
export default useMembershipTypes
