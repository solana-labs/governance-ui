import useRealm from '@hooks/useRealm'
import { GoverningTokenType } from '@solana/spl-governance'

const useMembershipTypes = () => {
  const { config } = useRealm()
  const maybeCouncil =
    config?.account.councilTokenConfig.tokenType ===
    GoverningTokenType.Membership
      ? (['council'] as const)
      : ([] as const)
  const maybeCommunity =
    config?.account.communityTokenConfig.tokenType ===
    GoverningTokenType.Membership
      ? (['community'] as const)
      : ([] as const)
  return [...maybeCouncil, ...maybeCommunity]
}
export default useMembershipTypes
