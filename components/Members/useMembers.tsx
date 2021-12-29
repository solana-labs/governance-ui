import { TokenRecordsWithWalletAddress } from './types'
import useRealm from '@hooks/useRealm'
import { useEffect, useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { getTokenAccountsByMint } from 'scripts/api'
import { parseTokenAccountData } from '@utils/tokens'
import { AccountInfo } from '@solana/spl-token'
import { Member } from 'utils/uiTypes/members'
import { BN } from '@project-serum/anchor'
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
  const [members, setMembers] = useState<Member[]>([])
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
    ...tokenRecordArray.filter(
      (x) =>
        x.community?.info.totalVotesCount &&
        x.community?.info.totalVotesCount > 0
    ),
    ...councilRecordArray,
  ]

  //merge community and council vote records to one big array of members
  //sort them by totalVotes sum of community and council votes
  const membersWithTokensDeposited = useMemo(
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
              .reduce<Member>(
                (acc, curr) => {
                  acc['walletAddress'] = curr.walletAddress
                  if (curr.community) {
                    acc['communityVotes'] =
                      curr.community.info.governingTokenDepositAmount
                    acc['votesCasted'] += curr.community.info.totalVotesCount
                  }
                  if (curr.council) {
                    acc['councilVotes'] =
                      curr.council.info.governingTokenDepositAmount
                    acc['votesCasted'] += curr.council.info.totalVotesCount
                  }
                  return acc
                },
                {
                  walletAddress: '',
                  votesCasted: 0,
                  councilVotes: new BN(0),
                  communityVotes: new BN(0),
                }
              ),
          }
        })
        .sort((a, b) => {
          return a.votesCasted - b.votesCasted
        })
        .reverse(),

    [JSON.stringify(tokenRecordArray), JSON.stringify(councilRecordArray)]
  )

  useEffect(() => {
    const fetchOutsideRealmMembers = async () => {
      let councilMembers: AccountInfo[] = []
      if (realm?.info.config.councilMint) {
        councilMembers = await fetchMembersWithTokensOutsideRealm(
          realm.info.config.councilMint.toBase58()
        )
      }
      councilMembers = councilMembers.filter((x) => x.amount.toNumber() !== 0)
      for (const councilMember of councilMembers) {
        const member = membersWithTokensDeposited.find(
          (x) => x.walletAddress === councilMember.owner.toBase58()
        )
        if (member) {
          member.councilVotes = member.councilVotes.add(councilMember.amount)
        } else {
          membersWithTokensDeposited.push({
            walletAddress: councilMember.owner.toBase58(),
            votesCasted: 0,
            councilVotes: councilMember.amount,
            communityVotes: new BN(0),
          })
        }
      }
      setMembers(membersWithTokensDeposited)
    }

    fetchOutsideRealmMembers()
  }, [realm?.pubkey.toBase58()])
  return {
    tokenRecordArray,
    councilRecordArray,
    members,
  }
}
