import { TokenRecordsWithWalletAddress } from './types'
import useRealm from '@hooks/useRealm'
import { useEffect, useMemo } from 'react'
import useWalletStore from 'stores/useWalletStore'
import {
  getMultipleAccountInfoChunked,
  getTokenAccountsByMint,
  parseTokenAccountData,
  TokenProgramAccount,
} from '@utils/tokens'
import {
  AccountInfo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { Member, Delegates } from 'utils/uiTypes/members'
import { BN } from '@project-serum/anchor'
import { PublicKey } from '@solana/web3.js'
import { usePrevious } from '@hooks/usePrevious'
import { capitalize } from '@utils/helpers'
import useMembersStore from 'stores/useMembersStore'
export default function useMembers() {
  const { tokenRecords, councilTokenOwnerRecords, realm } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const previousRealmPubKey = usePrevious(realm?.pubkey.toBase58()) as string
  const setMembers = useMembersStore((s) => s.setMembers)
  const setDelegates = useMembersStore((s) => s.setDelegates)

  const fetchCouncilMembersWithTokensOutsideRealm = async () => {
    if (realm?.account.config.councilMint) {
      const tokenAccounts = await getTokenAccountsByMint(
        connection.current,
        realm.account.config.councilMint.toBase58()
      )
      const tokenAccountsInfo: TokenProgramAccount<AccountInfo>[] = []
      for (const acc of tokenAccounts) {
        tokenAccountsInfo.push(acc)
      }
      //we filter out people who dont have any tokens and we filter out accounts owned by realm e.g.
      //accounts that holds deposited tokens inside realm.
      return tokenAccountsInfo.filter(
        (x) =>
          !x.account.amount.isZero() &&
          x.account.owner.toBase58() !== realm?.pubkey.toBase58()
      )
    }
    return []
  }

  //This will need to be rewritten for better performance if some realm hits more then +-5k+ members
  const fetchCommunityMembersATAS = async () => {
    if (realm?.account.communityMint) {
      const ATAS: PublicKey[] = []
      //we filter out people who never voted and has tokens inside realm
      const communityTokenRecordsWallets = tokenRecordArray
        .filter((x) =>
          x.community?.account.governingTokenDepositAmount.isZero()
        )
        .map((x) => x.walletAddress)
      for (const walletAddress of communityTokenRecordsWallets) {
        const ata = await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID, // always ASSOCIATED_TOKEN_PROGRAM_ID
          TOKEN_PROGRAM_ID, // always TOKEN_PROGRAM_ID
          realm!.account.communityMint, // mint
          new PublicKey(walletAddress), // owner
          true
        )
        ATAS.push(ata)
      }
      const ownersAtas = await getMultipleAccountInfoChunked(
        connection.current,
        ATAS
      )
      const ownersAtasParsed: TokenProgramAccount<AccountInfo>[] = ownersAtas
        .filter((x) => x)
        .map((r) => {
          const publicKey = r!.owner
          const data = Buffer.from(r!.data)
          const account = parseTokenAccountData(r!.owner, data)
          return { publicKey, account }
        })
      return ownersAtasParsed
    }
    return []
  }

  const matchMembers = (
    membersArray,
    membersToMatch,
    type,
    pushNonExisting = false
  ) => {
    const votesPropoName = `${type.toLowerCase()}Votes`
    const hasVotesOutsidePropName = `has${capitalize(type)}TokenOutsideRealm`
    const members = [...membersArray]
    for (const memberToMatch of membersToMatch) {
      //We match members that had deposited tokens at least once
      const member = members.find(
        (x) => x.walletAddress === memberToMatch.account.owner.toBase58()
      )
      if (member) {
        member[votesPropoName] = member[votesPropoName].add(
          memberToMatch.account.amount
        )
        if (!memberToMatch.account.amount.isZero()) {
          member[hasVotesOutsidePropName] = true
        }
      } else if (pushNonExisting) {
        //we add members who never deposited tokens inside realm
        members.push({
          walletAddress: memberToMatch.account.owner.toBase58(),
          votesCasted: 0,
          [votesPropoName]: memberToMatch.account.amount,
          communityVotes: new BN(0),
          [hasVotesOutsidePropName]: true,
        })
      }
    }
    return members
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

  //for community we exclude people who never vote
  const communityAndCouncilTokenRecords = [
    ...tokenRecordArray,
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
                  const obj = {
                    ...acc,
                    walletAddress: curr.walletAddress,
                    communityVotes: curr.community
                      ? curr.community.account.governingTokenDepositAmount
                      : acc.communityVotes,
                    councilVotes: curr.council
                      ? curr.council.account.governingTokenDepositAmount
                      : acc.councilVotes,
                  }

                  if (curr.community) {
                    obj['votesCasted'] += curr.community.account.totalVotesCount
                    obj['delegateWalletCommunity'] =
                      curr.community.account.governanceDelegate
                  }
                  if (curr.council) {
                    obj['votesCasted'] += curr.council.account.totalVotesCount
                    obj['delegateWalletCouncil'] =
                      curr.council.account.governanceDelegate
                  }
                  return obj
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

    [
      JSON.stringify(tokenRecordArray),
      JSON.stringify(councilRecordArray),
      realm?.pubkey.toBase58(),
    ]
  )

  // Loop through Members list to get our delegates and their tokens
  // Return a object of key: walletId and value: object of arrays for council/community tokenOwnerRecords.
  const getDelegateWalletMap = (members: Array<Member>): Delegates => {
    const delegateMap = {} as Delegates
    members.forEach((member: Member) => {
      if (member?.delegateWalletCouncil) {
        const walletId = member?.delegateWalletCouncil.toBase58()
        if (delegateMap[walletId]) {
          const oldCouncilRecords = delegateMap[walletId].councilMembers || []

          delegateMap[walletId] = {
            ...delegateMap[walletId],
            councilMembers: [...oldCouncilRecords, member],
            councilTokenCount:
              (delegateMap[walletId]?.councilTokenCount || 0) +
              member.councilVotes.toNumber(),
          }
        } else {
          delegateMap[walletId] = {
            councilMembers: [member],
            councilTokenCount: member.councilVotes
              ? member.councilVotes.toNumber()
              : 0,
          }
        }
      }

      if (member?.delegateWalletCommunity) {
        const walletId = member?.delegateWalletCommunity.toBase58()
        if (delegateMap[walletId]) {
          const oldCommunityRecords =
            delegateMap[walletId].communityMembers || []

          delegateMap[walletId] = {
            ...delegateMap[walletId],
            communityMembers: [...oldCommunityRecords, member],
            communityTokenCount:
              (delegateMap[walletId]?.communityTokenCount || 0) +
              member.communityVotes.toNumber(),
          }
        } else {
          delegateMap[walletId] = {
            communityMembers: [member],
            communityTokenCount: member.communityVotes
              ? member.communityVotes.toNumber()
              : 0,
          }
        }
      }
    })

    return delegateMap
  }

  //Move to store if will be used more across application
  useEffect(() => {
    const handleSetMembers = async () => {
      let members = [...membersWithTokensDeposited]

      const councilMembers = await fetchCouncilMembersWithTokensOutsideRealm()
      const communityMembers = await fetchCommunityMembersATAS()
      members = matchMembers(members, councilMembers, 'council', true)
      members = matchMembers(members, communityMembers, 'community')

      setMembers(members)
    }
    const getDelegates = async () => {
      const members = [...membersWithTokensDeposited]
      const delegateMap = getDelegateWalletMap(members)
      setDelegates(delegateMap)
    }

    if (
      realm?.pubkey &&
      previousRealmPubKey !== realm?.pubkey.toBase58() &&
      !realm?.account.config.useCommunityVoterWeightAddin
    ) {
      handleSetMembers()
      getDelegates()
    }
    if (
      !realm?.pubkey ||
      (realm.pubkey && realm?.account.config.useCommunityVoterWeightAddin)
    ) {
      getDelegates()
      setMembers([])
    }
  }, [realm?.pubkey.toBase58()])
}
