import { TokenRecordsWithWalletAddress } from './types'
import useRealm from '@hooks/useRealm'
import { useEffect, useMemo, useState } from 'react'
import useWalletStore from 'stores/useWalletStore'
import { getTokenAccountsByMint, ProgramAccount } from '@utils/tokens'
import { AccountInfo } from '@solana/spl-token'
import { Member } from 'utils/uiTypes/members'
import { BN } from '@project-serum/anchor'
export default function useMembers() {
  const { tokenRecords, councilTokenOwnerRecords, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)

  const fetchMembersWithTokensOutsideRealm = async (mint: string) => {
    const tokenAccounts = await getTokenAccountsByMint(connection.current, mint)
    const tokenAccountsInfo: ProgramAccount<AccountInfo>[] = []
    for (const acc of tokenAccounts) {
      tokenAccountsInfo.push(acc)
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
    const handleSetMembers = async () => {
      let councilMembers: ProgramAccount<AccountInfo>[] = []
      //if realm has council mint we fetch token accounts with tokens inside wallet
      if (realm?.info.config.councilMint) {
        const members = [...membersWithTokensDeposited]
        councilMembers = await fetchMembersWithTokensOutsideRealm(
          realm.info.config.councilMint.toBase58()
        )
        //we filter out people who dont have any tokens and we filter out accounts owned by realm e.g.
        //accounts that holds deposited tokens inside realm.
        councilMembers = councilMembers.filter(
          (x) =>
            !x.account.amount.isZero() &&
            x.account.owner.toBase58() !== realm?.pubkey.toBase58()
        )
        for (const councilMember of councilMembers) {
          //We match members that had deposited tokens at least once
          const member = members.find(
            (x) => x.walletAddress === councilMember.account.owner.toBase58()
          )
          if (member) {
            member.councilVotes = member.councilVotes.add(
              councilMember.account.amount
            )
          } else {
            //we add members who never deposited tokens inside realm
            members.push({
              walletAddress: councilMember.account.owner.toBase58(),
              votesCasted: 0,
              councilVotes: councilMember.account.amount,
              communityVotes: new BN(0),
            })
          }
        }
        setMembers(
          members.filter(
            (x) => !x.councilVotes.isZero() || !x.communityVotes.isZero()
          )
        )
      } else {
        setMembers(membersWithTokensDeposited)
      }
    }

    handleSetMembers()
  }, [realm?.pubkey.toBase58()])

  return {
    tokenRecordArray,
    councilRecordArray,
    members,
  }
}
