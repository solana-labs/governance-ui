import { useRealmQuery } from '@hooks/queries/realm'

export default function (governingTokenRole: 'community' | 'council') {
  const realm = useRealmQuery().data?.result
  return governingTokenRole === 'community'
    ? realm?.account.communityMint
    : realm?.account.config.councilMint
}
