import { useCallback, useEffect, useMemo } from 'react'
import {
  AccountInfo,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  Token,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { BN_ZERO } from '@solana/spl-governance'
import {
  getMultipleAccountInfoChunked,
  getTokenAccountsByMint,
  parseTokenAccountData,
  TokenProgramAccount,
} from '@utils/tokens'
import { capitalize } from '@utils/helpers'
import { TokenRecordsWithWalletAddress } from './types'
import { Member, Delegates } from 'utils/uiTypes/members'
import useRealm from '@hooks/useRealm'
import useMembersStore from 'stores/useMembersStore'
import useWalletStore from 'stores/useWalletStore'
import { useRealmQuery } from '@hooks/queries/realm'

export default function useMembers() {
  const realm = useRealmQuery().data?.result
  const { tokenRecords, councilTokenOwnerRecords, config } = useRealm()
  const connection = useWalletStore((s) => s.connection)
  const setMembers = useMembersStore((s) => s.setMembers)
  const setDelegates = useMembersStore((s) => s.setDelegates)

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

  const fetchCouncilMembersWithTokensOutsideRealm = useCallback(async () => {
    if (realm?.account.config.councilMint) {
      const tokenAccounts = await getTokenAccountsByMint(
        connection.current,
        realm.account.config.councilMint.toBase58()
      )
      const tokenAccountsInfo: TokenProgramAccount<AccountInfo>[] = []
      for (const acc of tokenAccounts) {
        tokenAccountsInfo.push(acc)
      }
      // we filter out people who dont have any tokens and we filter out accounts owned by realm e.g.
      // accounts that holds deposited tokens inside realm.
      return tokenAccountsInfo.filter(
        (x) =>
          !x.account.amount.isZero() &&
          x.account.owner.toBase58() !== realm?.pubkey.toBase58()
      )
    }
    return []
  }, [connection, realm?.account.config.councilMint, realm?.pubkey])

  // This will need to be rewritten for better performance if some realm hits more then +-5k+ members
  const fetchCommunityMembersATAS = useCallback(async () => {
    if (realm?.account.communityMint) {
      const ATAS: PublicKey[] = []
      // we filter out people who never voted and has tokens inside realm
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
  }, [connection, realm, tokenRecordArray])

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
      // We match members that had deposited tokens at least once
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
        // we add members who never deposited tokens inside realm
        members.push({
          walletAddress: memberToMatch.account.owner.toBase58(),
          votesCasted: 0,
          [votesPropoName]: memberToMatch.account.amount,
          communityVotes: BN_ZERO,
          [hasVotesOutsidePropName]: true,
        })
      }
    }
    return members
  }

  // for community we exclude people who never vote
  const communityAndCouncilTokenRecords = useMemo(
    () => [...tokenRecordArray, ...councilRecordArray],
    [councilRecordArray, tokenRecordArray]
  )
  // merge community and council vote records to one big array of members
  // sort them by totalVotes sum of community and council votes
  const membersWithTokensDeposited = useMemo(
    () =>
      // remove duplicated walletAddresses
      Array.from(
        new Set(communityAndCouncilTokenRecords.map((s) => s.walletAddress))
      )
        // deduplication
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
                    obj.delegateWalletCommunity =
                      curr.community.account.governanceDelegate
                  }
                  if (curr.council) {
                    obj.delegateWalletCouncil =
                      curr.council.account.governanceDelegate
                  }
                  return obj
                },
                {
                  walletAddress: '',
                  councilVotes: BN_ZERO,
                  communityVotes: BN_ZERO,
                }
              ),
          }
        })
        // .sort((a, b) => a.votesCasted - b.votesCasted)
        .reverse(),
    [communityAndCouncilTokenRecords]
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
            councilTokenCount: (
              delegateMap[walletId]?.councilTokenCount ?? BN_ZERO
            ).add(member.councilVotes),
          }
        } else {
          delegateMap[walletId] = {
            councilMembers: [member],
            councilTokenCount: member.councilVotes
              ? member.councilVotes
              : BN_ZERO,
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
            communityTokenCount: (
              delegateMap[walletId]?.communityTokenCount ?? BN_ZERO
            ).add(member.communityVotes),
          }
        } else {
          delegateMap[walletId] = {
            communityMembers: [member],
            communityTokenCount: member.communityVotes
              ? member.communityVotes
              : BN_ZERO,
          }
        }
      }
    })

    return delegateMap
  }

  // Move to store if will be used more across application
  useEffect(() => {
    console.log('useMembers is fetching')

    const handleSetMembers = async () => {
      let members = [...membersWithTokensDeposited]

      const [councilMembers, communityMembers] = await Promise.all([
        fetchCouncilMembersWithTokensOutsideRealm(),
        fetchCommunityMembersATAS(),
      ])

      members = matchMembers(members, councilMembers, 'council', true)
      members = matchMembers(members, communityMembers, 'community')

      setMembers(members)
    }

    const getDelegates = async () => {
      const members = [...membersWithTokensDeposited]
      const delegateMap = getDelegateWalletMap(members)
      setDelegates(delegateMap)
    }
    handleSetMembers()
    getDelegates()
  }, [
    config?.account.communityTokenConfig.voterWeightAddin,
    fetchCommunityMembersATAS,
    fetchCouncilMembersWithTokensOutsideRealm,
    membersWithTokensDeposited,
    realm?.pubkey,
    setDelegates,
    setMembers,
  ])
}
