import { TokenRecordsWithWalletAddress } from './types'
import useRealm from '@hooks/useRealm'
import { useMemo } from 'react'

export default function useMembers() {
  const { tokenRecords, councilTokenOwnerRecords } = useRealm()
  const tokenRecordArray: TokenRecordsWithWalletAddress[] = useMemo(
    () =>
      tokenRecords
        ? Object.keys(tokenRecords).flatMap((x) => {
            return {
              walletAddress: x,
              community: { ...tokenRecords[x] },
            }
          })
        : [],
    [tokenRecords]
  )
  const councilRecordArray: TokenRecordsWithWalletAddress[] = useMemo(
    () =>
      councilTokenOwnerRecords
        ? Object.keys(councilTokenOwnerRecords).flatMap((x) => {
            return {
              walletAddress: x,
              council: { ...councilTokenOwnerRecords[x] },
            }
          })
        : [],
    [councilTokenOwnerRecords]
  )
  const communityAndCouncilTokenRecords = [
    ...tokenRecordArray,
    ...councilRecordArray,
  ]

  const members = useMemo(
    () =>
      Array.from(
        new Set(communityAndCouncilTokenRecords.map((s) => s.walletAddress))
      )
        .map((walletAddress) => {
          return {
            ...communityAndCouncilTokenRecords
              .filter((x) => x.walletAddress === walletAddress)
              .reduce<TokenRecordsWithWalletAddress>(
                (acc, curr) => {
                  acc['walletAddress'] = curr.walletAddress
                  if (curr.community) {
                    acc['community'] = curr.community
                  }
                  if (curr.council) {
                    acc['council'] = curr.council
                  }

                  return acc
                },
                { walletAddress: '' }
              ),
          }
        })
        .filter(
          (x) =>
            x.council?.info.totalVotesCount !== 0 ||
            x.community?.info.totalVotesCount !== 0
        )
        .sort((a, b) => {
          return (
            (b.community?.info.totalVotesCount || 0) +
            (b.council?.info.totalVotesCount || 0) -
            ((a.community?.info.totalVotesCount || 0) +
              (a.council?.info.totalVotesCount || 0))
          )
        }),
    [tokenRecordArray, councilRecordArray]
  )
  console.log(members)
  return {
    tokenRecordArray,
    councilRecordArray,
    members,
  }
}
