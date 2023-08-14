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
import { Member } from 'utils/uiTypes/members'
import { useRealmQuery } from '@hooks/queries/realm'
import { useTokenOwnerRecordsForRealmQuery } from '@hooks/queries/tokenOwnerRecord'
import { useQuery } from '@tanstack/react-query'
import { useConnection } from '@solana/wallet-adapter-react'
import { useRealmConfigQuery } from '@hooks/queries/realmConfig'
import { NFT_PLUGINS_PKS } from '@constants/plugins'
import { useNftRegistrarCollection } from '@hooks/useNftRegistrarCollection'
import { fetchDigitalAssetsByOwner } from '@hooks/queries/digitalAssets'
import { getNetworkFromEndpoint } from '@utils/connection'
import { BN } from '@coral-xyz/anchor'

/**
 * @deprecated
 * legacy structure for fetching data, you should probably not be using it.
 */
export const useMembersQuery = () => {
  const realm = useRealmQuery().data?.result
  const { data: tors } = useTokenOwnerRecordsForRealmQuery()

  const connection = useConnection()
  const config = useRealmConfigQuery().data?.result
  const currentPluginPk = config?.account.communityTokenConfig.voterWeightAddin
  const isNftMode =
    currentPluginPk && NFT_PLUGINS_PKS.includes(currentPluginPk?.toBase58())
  const usedCollectionsPks = useNftRegistrarCollection()

  const network = getNetworkFromEndpoint(connection.connection.rpcEndpoint)
  if (network === 'localnet') throw new Error()
  const enabled =
    tors !== undefined &&
    realm !== undefined &&
    (!isNftMode || usedCollectionsPks !== undefined)

  const query = useQuery({
    enabled,
    queryKey: [],
    queryFn: async () => {
      if (!enabled) throw new Error()

      const councilMint = realm.account.config.councilMint

      const communityMint = realm.account.communityMint

      const tokenRecordArray = isNftMode
        ? await Promise.all(
            tors.map(async (x) => {
              const ownedNfts = await fetchDigitalAssetsByOwner(
                network,
                x.account.governingTokenOwner
              )

              const verifiedNfts = ownedNfts.filter((nft) => {
                const collection = nft.grouping.find(
                  (x) => x.group_key === 'collection'
                )
                return (
                  collection &&
                  usedCollectionsPks.includes(collection.group_value)
                )
              })

              x.account.governingTokenDepositAmount = new BN( // maybe should use add?
                verifiedNfts.length * 10 ** 6
              )
              return {
                walletAddress: x.account.governingTokenOwner.toString(),
                community: x,
                _kind: 'community' as const,
              }
            })
          )
        : tors
            .filter((x) => x.account.governingTokenMint.equals(communityMint))
            .map((x) => ({
              walletAddress: x.account.governingTokenOwner.toString(),
              community: x,
              _kind: 'community' as const,
            }))

      const councilRecordArray =
        councilMint !== undefined
          ? tors
              .filter((x) => x.account.governingTokenMint.equals(councilMint))
              .map((x) => ({
                walletAddress: x.account.governingTokenOwner.toString(),
                council: x,
                _kind: 'council' as const,
              }))
          : []

      const fetchCouncilMembersWithTokensOutsideRealm = async () => {
        if (realm?.account.config.councilMint) {
          const tokenAccounts = await getTokenAccountsByMint(
            connection.connection,
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
      }

      // This will need to be rewritten for better performance if some realm hits more then +-5k+ members
      const fetchCommunityMembersATAS = async () => {
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
              realm.account.communityMint, // mint
              new PublicKey(walletAddress), // owner
              true
            )
            ATAS.push(ata)
          }
          const ownersAtas = await getMultipleAccountInfoChunked(
            connection.connection,
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
        const hasVotesOutsidePropName = `has${capitalize(
          type
        )}TokenOutsideRealm`
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
      const communityAndCouncilTokenRecords = [
        ...tokenRecordArray,
        ...councilRecordArray,
      ]
      // merge community and council vote records to one big array of members
      // sort them by totalVotes sum of community and council votes
      const membersWithTokensDeposited =
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
                      communityVotes:
                        curr._kind === 'community'
                          ? curr.community.account.governingTokenDepositAmount
                          : acc.communityVotes,
                      councilVotes:
                        curr._kind === 'council'
                          ? curr.council.account.governingTokenDepositAmount
                          : acc.councilVotes,
                    }
                    if (curr._kind === 'community') {
                      obj.delegateWalletCommunity =
                        curr.community.account.governanceDelegate
                    }
                    if (curr._kind === 'council') {
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
          .reverse()

      // Move to store if will be used more across application

      console.log('useMembers is fetching')

      let members = [...membersWithTokensDeposited]
      const [councilMembers, communityMembers] = await Promise.all([
        fetchCouncilMembersWithTokensOutsideRealm(),
        fetchCommunityMembersATAS(),
      ])

      members = matchMembers(members, councilMembers, 'council', true)
      members = matchMembers(members, communityMembers, 'community')

      const activeMembers = members.filter(
        (x) => !x.councilVotes.isZero() || !x.communityVotes.isZero()
      )
      return activeMembers
    },
  })
  return query
}
