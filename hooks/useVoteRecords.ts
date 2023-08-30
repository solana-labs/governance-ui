import { useEffect, useMemo, useState } from 'react'
import { pipe } from 'fp-ts/function'
import { matchW, fromTaskOption } from 'fp-ts/TaskEither'
import {
  Proposal,
  ProgramAccount,
  VoteRecord,
  TokenOwnerRecord,
  RpcContext,
  VoteKind,
} from '@solana/spl-governance'

import useRpcContext from '@hooks/useRpcContext'
import { getVoteRecords, getTokenOwnerRecords } from '@models/proposal'
import useRealm from '@hooks/useRealm'
import { buildTopVoters } from '@models/proposal'
import useVotePluginsClientStore from 'stores/useVotePluginsClientStore'
import { getLockTokensVotingPowerPerWallet } from 'VoteStakeRegistry/tools/deposits'
import { BN } from '@coral-xyz/anchor'
import useGovernanceAssetsStore from 'stores/useGovernanceAssetsStore'
import { PublicKey } from '@solana/web3.js'
import { useRealmQuery } from './queries/realm'
import { useRealmCommunityMintInfoQuery } from './queries/mintInfo'
import useLegacyConnectionContext from './useLegacyConnectionContext'
import { calculateMaxVoteScore } from '@models/proposal/calulateMaxVoteScore'
import { getNetworkFromEndpoint } from '@utils/connection'
import { fetchDigitalAssetsByOwner } from './queries/digitalAssets'
import { useNftRegistrarCollection } from './useNftRegistrarCollection'
import { useAsync } from 'react-async-hook'

export default function useVoteRecords(proposal?: ProgramAccount<Proposal>) {
  const { getRpcContext } = useRpcContext()
  const [voteRecords, setVoteRecords] = useState<ProgramAccount<VoteRecord>[]>(
    []
  )
  const [tokenOwnerRecords, setTokenOwnerRecords] = useState<
    ProgramAccount<TokenOwnerRecord>[]
  >([])
  const realm = useRealmQuery().data?.result
  const mint = useRealmCommunityMintInfoQuery().data?.result
  const { vsrMode, isNftMode } = useRealm()

  //for vsr
  const [
    undecidedDepositByVoteRecord,
    setUndecidedDepositByVoteRecord,
  ] = useState<{ [walletPk: string]: BN }>({})
  const assetAccounts = useGovernanceAssetsStore((s) => s.assetAccounts)
  const mintsUsedInRealm = assetAccounts
    .filter((x) => x.isToken)
    .map((x) => x.extensions.mint!.publicKey)
  ///

  const [context, setContext] = useState<RpcContext | null>(null)
  const client = useVotePluginsClientStore((s) => s.state.vsrClient)
  const connection = useLegacyConnectionContext()
  const governingTokenMintPk = proposal?.account.governingTokenMint

  // for nft-voter
  // This part is to get the undecided nft-voter information for each proposal.
  // In buildTopVoters.ts, it checks whether the token_owner_record is in the vote_record.
  // If not, the function use record.account.governingTokenDepositAmount as the undecided vote weight, where nft-voter should be 0.
  // Thus, pre-calculating the undecided weight for each nft voter is necessary.
  const [nftMintRegistrar] = useVotePluginsClientStore((s) => [
    s.state.nftMintRegistrar,
  ])
  const usedCollectionsPks: string[] = useNftRegistrarCollection()

  const { result: undecidedNftsByVoteRecord } = useAsync(async () => {
    const network = getNetworkFromEndpoint(connection.endpoint)
    const enabled =
      isNftMode && usedCollectionsPks !== undefined && network !== 'localnet'
    if (!enabled) return {}

    // this filter out the token_owner_record that has already voted
    const undecidedVoter = tokenOwnerRecords.filter(
      (tokenOwnerRecord) =>
        !voteRecords
          .filter((x) => x.account.vote?.voteType !== VoteKind.Veto)
          .some(
            (voteRecord) =>
              voteRecord.account.governingTokenOwner.toBase58() ===
              tokenOwnerRecord.account.governingTokenOwner.toBase58()
          )
    )

    // get every nft owned by the undecided voter, then sum it up as the undecided weight(voting power)
    const walletsPks = undecidedVoter.map((x) => x.account.governingTokenOwner)
    const undecidedVoters = await Promise.all(
      walletsPks.map(async (walletPk) => {
        const ownedNfts = await fetchDigitalAssetsByOwner(network, walletPk)
        const verifiedNfts = ownedNfts.filter((nft) => {
          const collection = nft.grouping.find(
            (x) => x.group_key === 'collection'
          )
          return (
            collection && usedCollectionsPks.includes(collection.group_value)
          )
        })
        return {
          walletPk: walletPk,
          votingPower: verifiedNfts.length * 10 ** 6, //default decimal wieight is 10^6
        }
      })
    )
    // make it a dictionary structure
    const undecidedNftsByVoteRecord = Object.fromEntries(
      undecidedVoters.map((x) => [x.walletPk.toBase58(), new BN(x.votingPower)])
    )
    return undecidedNftsByVoteRecord
  }, [tokenOwnerRecords, voteRecords, usedCollectionsPks, isNftMode])
  ///

  useEffect(() => {
    if (context && proposal && realm) {
      // fetch vote records
      pipe(
        () =>
          getVoteRecords({
            connection: context.connection,
            programId: context.programId,
            proposalPk: proposal.pubkey,
          }),
        fromTaskOption(() => new Error('Could not fetch vote records')),
        matchW((reason) => {
          console.log(reason)
          setVoteRecords([])
        }, setVoteRecords)
      )()

      // fetch token records
      pipe(
        () =>
          getTokenOwnerRecords({
            governingTokenMint: governingTokenMintPk,
            connection: context.connection,
            programId: context.programId,
            realm: realm.pubkey,
          }),
        fromTaskOption(() => new Error('Could not fetch token records')),
        matchW((reason) => {
          console.log(reason)
          setTokenOwnerRecords([])
        }, setTokenOwnerRecords)
      )()
    }
  }, [context, governingTokenMintPk, proposal, realm])

  useEffect(() => {
    if (getRpcContext) {
      setContext(getRpcContext() ?? null)
    }
  }, [getRpcContext])
  const topVoters = useMemo(() => {
    if (realm && proposal && mint && !isNftMode) {
      const maxVote = calculateMaxVoteScore(realm, proposal, mint)
      return buildTopVoters(
        voteRecords,
        tokenOwnerRecords,
        mint,
        undecidedDepositByVoteRecord,
        maxVote
      )
    } else if (realm && proposal && mint && isNftMode) {
      const nftVoterPluginTotalWeight = nftMintRegistrar?.collectionConfigs.reduce(
        (prev, curr) => {
          const size = curr.size
          const weight = curr.weight
          if (typeof size === 'undefined' || typeof weight === 'undefined')
            return prev
          return prev + size * weight
        },
        0
      )
      return buildTopVoters(
        voteRecords,
        tokenOwnerRecords,
        mint,
        undecidedNftsByVoteRecord ?? {},
        new BN(nftVoterPluginTotalWeight)
      )
    }
    return []
  }, [
    voteRecords,
    tokenOwnerRecords,
    realm,
    proposal,
    mint,
    undecidedDepositByVoteRecord,
    undecidedNftsByVoteRecord,
    isNftMode,
    nftMintRegistrar,
  ])

  useEffect(() => {
    //VSR only
    const handleGetVsrVotingPowers = async (walletsPks: PublicKey[]) => {
      if (!realm || !client) throw new Error()

      const votingPerWallet = await getLockTokensVotingPowerPerWallet(
        walletsPks,
        realm,
        client,
        connection.current
      )
      setUndecidedDepositByVoteRecord(votingPerWallet)
    }

    if (
      vsrMode === 'default' &&
      !Object.keys(undecidedDepositByVoteRecord).length
    ) {
      const undecidedData = tokenOwnerRecords.filter(
        (tokenOwnerRecord) =>
          !voteRecords
            .filter((x) => x.account.vote?.voteType !== VoteKind.Veto)
            .some(
              (voteRecord) =>
                voteRecord.account.governingTokenOwner.toBase58() ===
                tokenOwnerRecord.account.governingTokenOwner.toBase58()
            )
      )
      if (undecidedData.length && mintsUsedInRealm.length && realm && client) {
        handleGetVsrVotingPowers(
          undecidedData.map((x) => x.account.governingTokenOwner)
        )
      }
    }
  }, [
    tokenOwnerRecords.length,
    voteRecords.length,
    vsrMode,
    undecidedDepositByVoteRecord,
    tokenOwnerRecords,
    voteRecords,
    realm,
    client,
    connection,
    mintsUsedInRealm,
  ])
  ///////

  return topVoters
}
