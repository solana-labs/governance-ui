import { useMemo } from 'react'
import {
  useTokenOwnerRecordsDelegatedToUser,
  useUserCommunityTokenOwnerRecord,
  useUserCouncilTokenOwnerRecord,
} from './queries/tokenOwnerRecord'
import { BN } from 'bn.js'
import { useRealmQuery } from './queries/realm'
import { useAsync } from 'react-async-hook'

const useGovernancePower = () => {
  const councilTor = useUserCouncilTokenOwnerRecord()
  const communityTor = useUserCommunityTokenOwnerRecord()
  const realm = useRealmQuery().data?.result
  const torsDelegatedToUser = useTokenOwnerRecordsDelegatedToUser()

  const communityPowerFromDelegators = useMemo(() => {
    realm === undefined
      ? undefined
      : torsDelegatedToUser
          ?.filter((x) =>
            x.account.governingTokenMint.equals(realm.account.communityMint)
          )
          .map((x) => x.account.governingTokenDepositAmount)
          .reduce((x, acc) => x.add(acc), new BN(0))
  }, [realm, torsDelegatedToUser])

  const councilMintAddr = realm?.account.config.councilMint
  const councilPowerFromDelegators = useMemo(() => {
    councilMintAddr === undefined
      ? undefined
      : torsDelegatedToUser
          ?.filter((x) => x.account.governingTokenMint.equals(councilMintAddr))
          .map((x) => x.account.governingTokenDepositAmount)
          .reduce((x, acc) => x.add(acc), new BN(0))
  }, [councilMintAddr, torsDelegatedToUser])

  const commpd = useAsync(async () => {
    if (realm === undefined || torsDelegatedToUser === undefined)
      return undefined

    const communityTors = torsDelegatedToUser.filter((x) =>
      x.account.governingTokenMint.equals(realm.account.communityMint)
    )

    const powers = await Promise.all([])
  }, [])
}

export const useCouncilPowerFromDelegators = () => {
  const realm = useRealmQuery().data?.result
  const torsDelegatedToUser = useTokenOwnerRecordsDelegatedToUser()
  const councilMintAddr = realm?.account.config.councilMint

  const councilPowerFromDelegators = useMemo(
    () =>
      councilMintAddr === undefined
        ? undefined
        : torsDelegatedToUser
            ?.filter((x) =>
              x.account.governingTokenMint.equals(councilMintAddr)
            )
            .map((x) => x.account.governingTokenDepositAmount)
            .reduce((x, acc) => x.add(acc), new BN(0)),
    [councilMintAddr, torsDelegatedToUser]
  )

  return councilPowerFromDelegators
}

export default useGovernancePower
