import { TokenRecordWithWallet } from './types'
import useRealm from '@hooks/useRealm'
import { useMemo } from 'react'

export default function useMembers() {
  const { tokenRecords, councilTokenOwnerRecords } = useRealm()
  const tokenRecordArray: TokenRecordWithWallet[] = useMemo(
    () =>
      tokenRecords
        ? Object.keys(tokenRecords).flatMap((x) => {
            return {
              walletAddress: x,
              ...tokenRecords[x],
            }
          })
        : [],
    [tokenRecords]
  )
  const councilRecordArray: TokenRecordWithWallet[] = useMemo(
    () =>
      councilTokenOwnerRecords
        ? Object.keys(councilTokenOwnerRecords).flatMap((x) => {
            return {
              walletAddress: x,
              ...councilTokenOwnerRecords[x],
            }
          })
        : [],
    [councilTokenOwnerRecords]
  )
  const members = useMemo(
    () =>
      [...tokenRecordArray, ...councilRecordArray]
        .filter((x) => x.info.totalVotesCount !== 0)
        .sort((a, b) => {
          return b.info.totalVotesCount - a.info.totalVotesCount
        }),
    [tokenRecordArray, councilRecordArray]
  )

  return {
    tokenRecordArray,
    councilRecordArray,
    members,
  }
}
