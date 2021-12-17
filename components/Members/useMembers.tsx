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
    //JSON stringify for performance
    [JSON.stringify(tokenRecords)]
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
    [JSON.stringify(councilTokenOwnerRecords)]
  )
  const communityAndCouncilTokenRecords = [
    ...tokenRecordArray,
    ...councilRecordArray,
  ]

  //merge community and council vote records to one big array of members
  //sort them by totalVotes sum of community and council votes
  const members = useMemo(
    () =>
      //remove duplicated walletAddresses
      Array.from(
        new Set(communityAndCouncilTokenRecords.map((s) => s.walletAddress))
      )
        //deduplication
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
        .sort((a, b) => {
          const prevCommunityInfo = a.community?.info
          const prevCouncilInfo = a.council?.info
          const nextCouncilInfo = b.council?.info
          const nextCommunityInfo = b.community?.info

          const prevCommunityVotes = prevCommunityInfo?.totalVotesCount || 0
          const prevCouncilVotes = prevCouncilInfo?.totalVotesCount || 0
          const nextCommunityVotes = nextCommunityInfo?.totalVotesCount || 0
          const nextCouncilVotes = nextCouncilInfo?.totalVotesCount || 0

          const prevTotalVotes = prevCommunityVotes + prevCouncilVotes
          const nextTotalVotes = nextCommunityVotes + nextCouncilVotes

          return prevTotalVotes - nextTotalVotes
        })
        .reverse(),
    [JSON.stringify(tokenRecordArray), JSON.stringify(councilRecordArray)]
  )

  return {
    tokenRecordArray,
    councilRecordArray,
    members,
  }
}
