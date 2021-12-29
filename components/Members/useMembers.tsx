import { TokenRecordsWithWalletAddress } from './types'
import useRealm from '@hooks/useRealm'
import { useEffect, useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { getTokenAccountsByMint } from 'scripts/api'
import { parseTokenAccountData } from '@utils/tokens'
import { AccountInfo } from '@solana/spl-token'

export default function useMembers() {
  const { tokenRecords, councilTokenOwnerRecords, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)

  const fetchMembersWithTokensOutsideRealm = async (mint: string) => {
    const tokenAccounts = await getTokenAccountsByMint(connection, mint)

    const tokenAccountsInfo: AccountInfo[] = []
    for (const acc of tokenAccounts) {
      const parsed = parseTokenAccountData(acc.pubkey, acc.account.data)
      tokenAccountsInfo.push(parsed)
    }
    return tokenAccountsInfo
  }

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
    [JSON.stringify(tokenRecords)]
  )
  //we take only records who have stored tokens inside realm
  //TODO check ATA wallet
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
          const { community: prevCommunity, council: prevCouncil } = a
          const { community: nextCommunity, council: nextCouncil } = b
          const prevCommunityVotes = prevCommunity?.info?.totalVotesCount || 0
          const prevCouncilVotes = prevCouncil?.info?.totalVotesCount || 0
          const nextCommunityVotes = nextCommunity?.info?.totalVotesCount || 0
          const nextCouncilVotes = nextCouncil?.info?.totalVotesCount || 0

          const prevTotalVotes = prevCommunityVotes + prevCouncilVotes
          const nextTotalVotes = nextCommunityVotes + nextCouncilVotes

          return prevTotalVotes - nextTotalVotes
        })
        .reverse(),

    [JSON.stringify(tokenRecordArray), JSON.stringify(councilRecordArray)]
  )

  useEffect(() => {
    const fetchOutsideRealmMembers = async () => {
      let communityMembers: AccountInfo[] = []
      let councilMembers: AccountInfo[] = []
      if (realm?.info.communityMint) {
        communityMembers = await fetchMembersWithTokensOutsideRealm(
          realm.info.communityMint.toBase58()
        )
      }
      if (realm?.info.config.councilMint) {
        councilMembers = await fetchMembersWithTokensOutsideRealm(
          realm.info.config.councilMint.toBase58()
        )
      }
      console.log(communityMembers, councilMembers, '@@@@@')
    }

    fetchOutsideRealmMembers()
  }, [realm?.pubkey.toBase58()])
  return {
    tokenRecordArray,
    councilRecordArray,
    members,
  }
}
